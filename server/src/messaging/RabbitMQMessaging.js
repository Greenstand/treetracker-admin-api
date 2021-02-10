import { BrokerAsPromised as Broker } from 'rascal';
import { config } from './config';

const publishMessage = (async (payload, resultHandler) => {
    const broker = await Broker.create(config);
    try {
        const publication = await broker.publish("admin-verification", payload);
        publication
        .on("success", resultHandler)
        .on("error", (err, messageId)=> {
            console.error(`Error with id ${messageId} ${err.message}`);
            throw err;
        });
    } catch(err) {
        console.error(`Error publishing message ${err}`);
    }
});

export { publishMessage };
