type requestData = {
    path: string,
    method: string,
    body?: object,
};

const getDevices = () => ([{
    path: '/devices',
    method: 'get',
}]);

const setAdvancedAudioFeature = (deviceId: string, feature: string, value: boolean): requestData[] => ([{
    path: `/devices/${deviceId}/commands`,
    method: 'post',
    body: {
        commands: [
            {
                component: 'main',
                capability: 'execute',
                command: 'execute',
                arguments: [
                    '/sec/networkaudio/advancedaudio',
                    {
                        [`x.com.samsung.networkaudio.${feature}`]: +!!value,
                    },
                ],
            },
        ],
    },
}]);

const getAdvancedAudioStatus = (deviceId: string): requestData[] => [
    {
        path: `/devices/${deviceId}/commands`,
        method: 'post',
        body: {
            commands: [
                {
                    component: 'main',
                    capability: 'execute',
                    command: 'execute',
                    arguments: ['/sec/networkaudio/advancedaudio'],
                },
            ],
        },
    },
    {
        path: `/devices/${deviceId}/components/main/capabilities/execute/status`,
        method: 'get',
    },
];

const getSoundMode = (deviceId: string): requestData[] => [
    {
        path: `/devices/${deviceId}/commands`,
        method: 'post',
        body: {
            commands: [
                {
                    component: 'main',
                    capability: 'execute',
                    command: 'execute',
                    arguments: ['/sec/networkaudio/soundmode'],
                },
            ],
        },
    },
    {
        path: `/devices/${deviceId}/components/main/capabilities/execute/status`,
        method: 'get',
    },
];

const setSoundMode = (deviceId: string, value: string): requestData => ({
    path: `/devices/${deviceId}/commands`,
    method: 'post',
    body: {
        commands: [
            {
                component: 'main',
                capability: 'execute',
                command: 'execute',
                arguments: [
                    '/sec/networkaudio/soundmode',
                    {
                        'x.com.samsung.networkaudio.soundmode': value,
                    },
                ],
            },
        ],
    },
});

export {
    getDevices,
    setAdvancedAudioFeature,
    getAdvancedAudioStatus,
    getSoundMode,
    setSoundMode,
};