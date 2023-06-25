const setAdvancedAudioFeature = (feature, value) => ({
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
});

const getAdvancedAudioStatus = () => [
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

const getSoundMode = () => [
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

const setSoundMode = value => ({
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

module.exports = {
    setAdvancedAudioFeature,
    getAdvancedAudioStatus,
    getSoundMode,
    setSoundMode,
};