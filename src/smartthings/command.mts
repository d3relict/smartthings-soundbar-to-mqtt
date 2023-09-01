type requestData = {
    path: string,
    method: string,
    body?: object,
};

const setAdvancedAudioFeature = (feature: string, value: boolean): requestData[] => ([{
    path: '/commands',
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

const getAdvancedAudioStatus = (): requestData[] => [
    {
        method: 'post',
        path: '/commands',
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
        path: '/components/main/capabilities/execute/status',
        method: 'get',
    },
];

const getSoundMode = (): requestData[] => [
    {
        path: '/commands',
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
        path: '/components/main/capabilities/execute/status',
        method: 'get',
    },
];

const setSoundMode = (value: string): requestData => ({
    path: '/commands',
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
    setAdvancedAudioFeature,
    getAdvancedAudioStatus,
    getSoundMode,
    setSoundMode,
};