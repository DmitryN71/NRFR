import React from 'react';
import type {AppStatus, DeviceInfo} from '../../types';

interface Props {
    device: DeviceInfo;
    appsStatus: AppStatus;
    isLoading: boolean;
    onInstall: () => void;
    onUpdate: () => void;
    onNext: () => void;
}

export const AppInstall: React.FC<Props> = ({device, appsStatus, isLoading, onInstall, onUpdate, onNext}) => {
    // Only apps that are not installed at all require action
    const needsRequiredAction = !appsStatus.shizuku || !appsStatus.nrfr.installed;
    // Apps with available updates
    const hasOptionalUpdate = appsStatus.nrfr.installed && appsStatus.nrfr.needUpdate;
    // Installation complete (regardless of update status)
    const isComplete = appsStatus.shizuku && appsStatus.nrfr.installed;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Install Apps</h2>
            <div className="text-center text-sm text-gray-600 mb-4">
                Current device: {device.model || 'Unknown device'} ({device.serial})
            </div>
            <div className="space-y-2">
                {!appsStatus.shizuku && (
                    <div className="p-4 bg-white/50 backdrop-blur-sm rounded-lg flex justify-between items-center">
                        <span>Shizuku needs to be installed</span>
                        {isLoading && (
                            <div className="animate-spin">
                                <svg className="w-4 h-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                                     viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                    </div>
                )}
                {!appsStatus.nrfr.installed && (
                    <div className="p-4 bg-white/50 backdrop-blur-sm rounded-lg flex justify-between items-center">
                        <span>Nrfr needs to be installed</span>
                        {isLoading && (
                            <div className="animate-spin">
                                <svg className="w-4 h-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                                     viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                    </div>
                )}
                {isComplete && (
                    <div className="p-4 bg-green-50 backdrop-blur-sm rounded-lg">
                        <div className="flex items-center justify-center text-green-600">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>All required apps are installed</span>
                        </div>
                    </div>
                )}
                {hasOptionalUpdate && (
                    <div className="p-4 bg-white/50 backdrop-blur-sm rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                </svg>
                                <span>A new version of Nrfr is available</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-2">
                {needsRequiredAction && (
                    <button
                        className="w-full bg-blue-500/80 hover:bg-blue-600/80 text-white font-medium py-2 px-4 rounded-lg transition-all"
                        onClick={onInstall}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Installing...' : 'Install Required Apps'}
                    </button>
                )}
                {hasOptionalUpdate && !needsRequiredAction && (
                    <button
                        className="w-full bg-blue-500/80 hover:bg-blue-600/80 text-white font-medium py-2 px-4 rounded-lg transition-all"
                        onClick={onUpdate}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Updating...' : 'Update to Latest Version'}
                    </button>
                )}
                {isComplete && (
                    <button
                        className="w-full bg-blue-500/80 hover:bg-blue-600/80 text-white font-medium py-2 px-4 rounded-lg transition-all"
                        onClick={onNext}
                        disabled={isLoading}
                    >
                        Continue to Next Step {hasOptionalUpdate ? '(Skip Update)' : ''}
                    </button>
                )}
            </div>
        </div>
    );
};
