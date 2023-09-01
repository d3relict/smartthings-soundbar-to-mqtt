import { z } from 'zod';

const homeAssistantConfigSchema = z.object({
    uniqueId: z.string(),
    device: z.object({
        name: z.string(),
        manufacturer: z.string(),
        model: z.string(),
        identifiers: z.array(z.string()),
    }),
    payload: z.object({
        switch: z.array(z.string()).length(2),
    }),
});

type THomeAssistantConfig = z.infer<typeof homeAssistantConfigSchema>;

const mqttConfigSchema = z.object({
    url: z.string(),
    username: z.string(),
    password: z.string(),
});

type TMqttConfig = z.infer<typeof mqttConfigSchema>;

const smartthingsConfigSchema = z.object({
    baseUrl: z.string(),
    apiKey: z.string(),
    deviceId: z.string(),
});

type TSmartthingsConfig = z.infer<typeof smartthingsConfigSchema>;

const serviceConfigSchema = z.object({
    homeassistant: homeAssistantConfigSchema,
    mqtt: mqttConfigSchema,
    smartthings: smartthingsConfigSchema,
});

type TServiceConfig = z.infer<typeof serviceConfigSchema>;

export {
    THomeAssistantConfig,
    homeAssistantConfigSchema,
    TMqttConfig,
    mqttConfigSchema,
    TServiceConfig,
    serviceConfigSchema,
    TSmartthingsConfig,
    smartthingsConfigSchema,
}