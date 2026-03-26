import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {DeviceInfo} from '../../types';

interface Props {
    devices: DeviceInfo[];
    onSelect: (device: DeviceInfo) => void;
    onRefresh: () => void;
    isLoading?: boolean;
}

export const DeviceSelection: React.FC<Props> = ({devices, onSelect, onRefresh, isLoading = false}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [lastDevices, setLastDevices] = useState<DeviceInfo[]>([]);
    const [showLoading, setShowLoading] = useState(false);
    const loadingTimer = useRef<ReturnType<typeof setTimeout>>(null);

    // Handle delayed display of loading state
    useEffect(() => {
        if (isLoading) {
            // Delay showing loading state to avoid flickering
            loadingTimer.current = setTimeout(() => {
                setShowLoading(true);
            }, 300);
        } else {
            if (loadingTimer.current) {
                clearTimeout(loadingTimer.current);
            }
            setShowLoading(false);
        }
        return () => {
            if (loadingTimer.current) {
                clearTimeout(loadingTimer.current);
            }
        };
    }, [isLoading]);

    // Handle device list updates with debouncing
    useEffect(() => {
        const devicesStr = JSON.stringify(devices);
        const lastDevicesStr = JSON.stringify(lastDevices);

        if (devicesStr !== lastDevicesStr) {
            setLastDevices(devices);

            // Only update selection state when device list changes substantially
            if (devices.length > 0 && !selectedDevice) {
                handleSelect(devices[0]);
            } else if (selectedDevice) {
                const deviceStillExists = devices.find(d => d.serial === selectedDevice.serial);
                if (!deviceStillExists) {
                    setSelectedDevice(null);
                    setIsConfirmed(false);
                }
            }
        }
    }, [devices, lastDevices, selectedDevice]);

    const filteredDevices = devices.filter(device =>
        device.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.serial.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = useCallback((device: DeviceInfo) => {
        setSelectedDevice(device);
        setIsOpen(false);
        setIsConfirmed(false);
    }, []);

    const handleConfirm = useCallback(() => {
        if (selectedDevice) {
            setIsConfirmed(true);
            onSelect(selectedDevice);
        }
    }, [selectedDevice, onSelect]);

    // Auto-refresh timer
    useEffect(() => {
        const timer = setInterval(onRefresh, 2000);
        return () => clearInterval(timer);
    }, [onRefresh]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.device-dropdown')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderDeviceInfo = () => {
        if (selectedDevice) {
            return (
                <div className="min-h-[2.5rem] flex flex-col justify-center">
                    <div className="font-medium leading-snug">{selectedDevice.model || 'Unknown device'}</div>
                    <div className="text-sm text-gray-600 leading-snug">
                        {selectedDevice.product ? `${selectedDevice.product} • ` : ''}{selectedDevice.serial}
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-[2.5rem] flex items-center">
                <span className="text-gray-500">
                    {showLoading ? 'Detecting devices...' : 'Please select a device'}
                </span>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Select Device</h2>

            <div className="relative device-dropdown">
                {/* Selection box */}
                <button
                    type="button"
                    className={`w-full p-4 bg-white/50 backdrop-blur-sm rounded-lg transition-all text-left flex justify-between items-center ${
                        !isConfirmed && 'hover:bg-white/60'
                    }`}
                    onClick={() => !isConfirmed && setIsOpen(!isOpen)}
                    disabled={isConfirmed}
                >
                    {renderDeviceInfo()}
                    <div className="flex items-center ml-2 shrink-0">
                        {showLoading && (
                            <div className="animate-spin mr-2">
                                <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                                     viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                        {!isConfirmed && (
                            <svg
                                className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                            </svg>
                        )}
                        {isConfirmed && (
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                            </svg>
                        )}
                    </div>
                </button>

                {/* Dropdown panel */}
                {isOpen && !isConfirmed && (
                    <div
                        className="absolute z-10 w-full mt-1 bg-white/95 backdrop-blur-md rounded-lg shadow-lg overflow-hidden flex flex-col"
                        style={{
                            maxHeight: 'min(400px, calc(100vh - 300px))',
                            bottom: filteredDevices.length > 5 ? 'auto' : undefined
                        }}
                    >
                        {/* Search box */}
                        <div className="sticky top-0 p-2 border-b border-gray-200 bg-white/95 backdrop-blur-md z-10">
                            <input
                                type="text"
                                className="w-full p-2 bg-white/50 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search devices..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Device list */}
                        <div className="overflow-y-auto overscroll-contain">
                            {filteredDevices.length > 0 ? (
                                filteredDevices.map((device) => (
                                    <button
                                        key={device.serial}
                                        className={`w-full p-4 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 ${
                                            selectedDevice?.serial === device.serial ? 'bg-blue-50' : ''
                                        }`}
                                        onClick={() => handleSelect(device)}
                                    >
                                        <div className="min-h-[2.5rem] flex flex-col justify-center">
                                            <div className="font-medium leading-snug">{device.model || 'Unknown device'}</div>
                                            <div className="text-sm text-gray-600 leading-snug">
                                                {device.product ? `${device.product} • ` : ''}{device.serial}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div
                                    className="p-4 text-center text-gray-500 min-h-[4rem] flex items-center justify-center">
                                    {devices.length === 0 ? (
                                        <>
                                            {showLoading ? 'Detecting devices...' : 'No devices detected'}
                                            {!showLoading && (
                                                <button
                                                    className="ml-2 text-blue-500 hover:text-blue-600"
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        onRefresh();
                                                    }}
                                                >
                                                    Refresh
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        'No matching devices found'
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm button */}
            {selectedDevice && !isConfirmed && (
                <button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
                    onClick={handleConfirm}
                    disabled={showLoading}
                >
                    Confirm Selection
                </button>
            )}

            {/* Refresh button */}
            <button
                className="w-full mt-2 p-2 text-blue-500 hover:text-blue-600 text-sm flex items-center justify-center"
                onClick={() => {
                    setIsOpen(false);
                    onRefresh();
                }}
                disabled={showLoading || isConfirmed}
            >
                {showLoading ? (
                    <>
                        <div className="animate-spin mr-2">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        Detecting devices...
                    </>
                ) : (
                    'Refresh Device List'
                )}
            </button>
        </div>
    );
};
