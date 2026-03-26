package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/electricbubble/gadb"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx            context.Context
	adbClient      gadb.Client
	selectedDevice *gadb.Device
	adbPath        string // Save adb path for use when closing
}

// DeviceInfo device info structure
type DeviceInfo struct {
	Serial  string `json:"serial"`
	State   string `json:"state"`
	Product string `json:"product"`
	Model   string `json:"model"`
}

// AppStatus app status structure
type AppStatus struct {
	Shizuku bool `json:"shizuku"`
	Nrfr    struct {
		Installed  bool `json:"installed"`
		NeedUpdate bool `json:"needUpdate"`
	} `json:"nrfr"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Try to start ADB server
	execPath, err := os.Executable()
	if err != nil {
		wailsruntime.LogError(ctx, fmt.Sprintf("Failed to get executable path: %v", err))
		return
	}
	execDir := filepath.Dir(execPath)

	// Prefer platform-tools in program directory
	adbPath := filepath.Join(execDir, "platform-tools", "adb")
	if runtime.GOOS == "windows" {
		adbPath = filepath.Join(execDir, "platform-tools", "adb.exe")
	}

	// If adb in program directory doesn't exist, try system PATH
	if _, err := os.Stat(adbPath); os.IsNotExist(err) {
		if runtime.GOOS == "windows" {
			// Try to get ANDROID_HOME from environment variable
			androidHome := os.Getenv("ANDROID_HOME")
			if androidHome == "" {
				// If no env variable, try default install path
				androidHome = filepath.Join(os.Getenv("LOCALAPPDATA"), "Android", "Sdk")
			}
			adbPath = filepath.Join(androidHome, "platform-tools", "adb.exe")
		} else {
			adbPath = "adb" // Use adb from PATH on Unix-like systems
		}
	}

	// Save adb path
	a.adbPath = adbPath

	// Check if ADB server is already running
	cmd := exec.Command(adbPath, "devices")
	hideCommandWindow(cmd)
	if err := cmd.Run(); err != nil {
		// ADB server not running, start it
		startCmd := exec.Command(adbPath, "start-server")
		hideCommandWindow(startCmd)
		if err := startCmd.Run(); err != nil {
			wailsruntime.LogError(ctx, fmt.Sprintf("Failed to start ADB server: %v", err))
		}
	}

	// Initialize ADB client
	client, err := gadb.NewClient()
	if err != nil {
		wailsruntime.LogError(ctx, fmt.Sprintf("Failed to initialize ADB: %v", err))
		return
	}
	a.adbClient = client
}

// shutdown is called when the app is closing
func (a *App) shutdown(ctx context.Context) {
	// Shut down ADB server
	if a.adbPath != "" {
		cmd := exec.Command(a.adbPath, "kill-server")
		hideCommandWindow(cmd)
		if err := cmd.Run(); err != nil {
			wailsruntime.LogError(ctx, fmt.Sprintf("Failed to shut down ADB server: %v", err))
		}
	}
}

// GetDevices gets the list of connected devices
func (a *App) GetDevices() []DeviceInfo {
	devices, err := a.adbClient.DeviceList()
	if err != nil {
		wailsruntime.LogError(a.ctx, fmt.Sprintf("Failed to get device list: %v", err))
		return nil
	}

	var deviceInfos []DeviceInfo
	for _, device := range devices {
		state, _ := device.State()
		product, _ := device.Product()
		model, _ := device.Model()

		info := DeviceInfo{
			Serial:  device.Serial(),
			State:   string(state),
			Product: product,
			Model:   model,
		}
		deviceInfos = append(deviceInfos, info)
	}
	return deviceInfos
}

// SelectDevice selects a device
func (a *App) SelectDevice(serial string) error {
	devices, err := a.adbClient.DeviceList()
	if err != nil {
		return fmt.Errorf("Failed to get device list: %v", err)
	}

	for _, device := range devices {
		if device.Serial() == serial {
			a.selectedDevice = &device
			return nil
		}
	}
	return fmt.Errorf("Device not found: %s", serial)
}

// CheckApps checks if required apps are installed
func (a *App) CheckApps() AppStatus {
	if a.selectedDevice == nil {
		return AppStatus{
			Shizuku: false,
			Nrfr: struct {
				Installed  bool `json:"installed"`
				NeedUpdate bool `json:"needUpdate"`
			}{
				Installed:  false,
				NeedUpdate: false,
			},
		}
	}

	// Check Shizuku
	shizukuInstalled, _ := a.isPackageInstalled("moe.shizuku.privileged.api")

	// Check Nrfr
	nrfrInstalled, _ := a.isPackageInstalled("com.github.nrfr")
	needUpdate := false
	if nrfrInstalled {
		needUpdate, _ = a.CheckNrfrUpdate()
	}

	return AppStatus{
		Shizuku: shizukuInstalled,
		Nrfr: struct {
			Installed  bool `json:"installed"`
			NeedUpdate bool `json:"needUpdate"`
		}{
			Installed:  nrfrInstalled,
			NeedUpdate: needUpdate,
		},
	}
}

// isPackageInstalled checks if a package is installed
func (a *App) isPackageInstalled(packageName string) (bool, error) {
	output, err := a.selectedDevice.RunShellCommand("pm", "list", "packages", packageName)
	if err != nil {
		return false, err
	}
	return strings.Contains(output, packageName), nil
}

// InstallShizuku installs Shizuku
func (a *App) InstallShizuku() error {
	if a.selectedDevice == nil {
		return fmt.Errorf("No device selected")
	}

	// Push APK from local resources to device
	execPath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("Failed to get executable path: %v", err)
	}
	execDir := filepath.Dir(execPath)
	localApk := filepath.Join(execDir, "resources", "shizuku.apk")
	remoteApk := "/data/local/tmp/shizuku.apk"

	// Check if file exists
	if _, err := os.Stat(localApk); os.IsNotExist(err) {
		return fmt.Errorf("Shizuku APK file not found: %s", localApk)
	}

	// Push APK file
	file, err := os.Open(localApk)
	if err != nil {
		return fmt.Errorf("Failed to open Shizuku APK file: %v", err)
	}
	defer file.Close()

	err = a.selectedDevice.Push(file, remoteApk, time.Now())
	if err != nil {
		return fmt.Errorf("Failed to push Shizuku APK file: %v", err)
	}

	// Install APK
	_, err = a.selectedDevice.RunShellCommand("pm", "install", "-r", remoteApk)
	if err != nil {
		return fmt.Errorf("Failed to install Shizuku: %v", err)
	}

	// Clean up temp files
	_, err = a.selectedDevice.RunShellCommand("rm", remoteApk)
	if err != nil {
		wailsruntime.LogWarning(a.ctx, fmt.Sprintf("Failed to clean up temp files: %v", err))
	}

	return nil
}

// InstallNrfr installs Nrfr
func (a *App) InstallNrfr() error {
	if a.selectedDevice == nil {
		return fmt.Errorf("No device selected")
	}

	// Push APK from local resources to device
	execPath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("Failed to get executable path: %v", err)
	}
	execDir := filepath.Dir(execPath)
	localApk := filepath.Join(execDir, "resources", "nrfr.apk")
	remoteApk := "/data/local/tmp/nrfr.apk"

	// Check if file exists
	if _, err := os.Stat(localApk); os.IsNotExist(err) {
		return fmt.Errorf("Nrfr APK file not found: %s", localApk)
	}

	// Push APK file
	file, err := os.Open(localApk)
	if err != nil {
		return fmt.Errorf("Failed to open Nrfr APK file: %v", err)
	}
	defer file.Close()

	err = a.selectedDevice.Push(file, remoteApk, time.Now())
	if err != nil {
		return fmt.Errorf("Failed to push Nrfr APK file: %v", err)
	}

	// Install APK
	_, err = a.selectedDevice.RunShellCommand("pm", "install", "-r", remoteApk)
	if err != nil {
		return fmt.Errorf("Failed to install Nrfr: %v", err)
	}

	// Clean up temp files
	_, err = a.selectedDevice.RunShellCommand("rm", remoteApk)
	if err != nil {
		wailsruntime.LogWarning(a.ctx, fmt.Sprintf("Failed to clean up temp files: %v", err))
	}

	return nil
}

// StartShizuku starts Shizuku
func (a *App) StartShizuku() error {
	if a.selectedDevice == nil {
		return fmt.Errorf("No device selected")
	}

	// First start Shizuku app
	_, err := a.selectedDevice.RunShellCommand("monkey", "-p", "moe.shizuku.privileged.api", "1")
	if err != nil {
		return fmt.Errorf("Failed to start Shizuku app: %v", err)
	}

	// Wait for app to start
	time.Sleep(time.Second * 2)

	// Execute start script
	output, err := a.selectedDevice.RunShellCommand("sh", "/sdcard/Android/data/moe.shizuku.privileged.api/start.sh")
	if err != nil {
		return fmt.Errorf("Failed to start Shizuku service: %v", err)
	}
	wailsruntime.LogInfo(a.ctx, fmt.Sprintf("Shizuku startup output: %s", output))
	return nil
}

// WindowMinimise minimizes the window
func (a *App) WindowMinimise() {
	wailsruntime.WindowMinimise(a.ctx)
}

// WindowMaximise maximizes the window
func (a *App) WindowMaximise() {
	wailsruntime.WindowToggleMaximise(a.ctx)
}

// WindowClose closes the window
func (a *App) WindowClose() {
	// First shut down ADB server
	if a.adbPath != "" {
		cmd := exec.Command(a.adbPath, "kill-server")
		hideCommandWindow(cmd)
		_ = cmd.Run() // Ignore error since we're about to exit
	}
	wailsruntime.Quit(a.ctx)
}

// StartNrfr starts the Nrfr app
func (a *App) StartNrfr() error {
	if a.selectedDevice == nil {
		return fmt.Errorf("no device selected")
	}

	// Use monkey to start Nrfr
	_, err := a.selectedDevice.RunShellCommand("monkey", "-p", "com.github.nrfr", "1")
	if err != nil {
		return fmt.Errorf("failed to start nrfr: %v", err)
	}

	return nil
}

// GetAppVersion gets the version of an installed app
func (a *App) GetAppVersion(packageName string) (string, error) {
	if a.selectedDevice == nil {
		return "", fmt.Errorf("No device selected")
	}

	output, err := a.selectedDevice.RunShellCommand("dumpsys", "package", packageName, "|", "grep", "versionName")
	if err != nil {
		return "", fmt.Errorf("Failed to get version: %v", err)
	}

	// Parse version
	parts := strings.Split(strings.TrimSpace(output), "=")
	if len(parts) != 2 {
		return "", fmt.Errorf("Failed to parse version")
	}
	return strings.TrimSpace(parts[1]), nil
}

// compareVersions compares two version strings, returns -1 if v1 < v2, 0 if v1 = v2, 1 if v1 > v2
func compareVersions(v1, v2 string) int {
	// Remove possible 'v' prefix
	v1 = strings.TrimPrefix(v1, "v")
	v2 = strings.TrimPrefix(v2, "v")

	// Split version string
	parts1 := strings.Split(v1, ".")
	parts2 := strings.Split(v2, ".")

	// Ensure both versions have three parts
	for len(parts1) < 3 {
		parts1 = append(parts1, "0")
	}
	for len(parts2) < 3 {
		parts2 = append(parts2, "0")
	}

	// Compare each part
	for i := 0; i < 3; i++ {
		num1, _ := strconv.Atoi(parts1[i])
		num2, _ := strconv.Atoi(parts2[i])

		if num1 < num2 {
			return -1
		}
		if num1 > num2 {
			return 1
		}
	}

	return 0
}

// CheckNrfrUpdate checks if Nrfr needs an update
func (a *App) CheckNrfrUpdate() (bool, error) {
	if a.selectedDevice == nil {
		return false, fmt.Errorf("No device selected")
	}

	// Check if installed
	installed, err := a.isPackageInstalled("com.github.nrfr")
	if err != nil {
		return false, err
	}

	if !installed {
		return true, nil // Not installed, needs installation
	}

	// Get installed version
	currentVersion, err := a.GetAppVersion("com.github.nrfr")
	if err != nil {
		return false, err
	}

	// Latest version (from build.gradle.kts)
	latestVersion := "1.0.3" // Hardcoded to current latest version

	// Compare versions
	return compareVersions(currentVersion, latestVersion) < 0, nil
}
