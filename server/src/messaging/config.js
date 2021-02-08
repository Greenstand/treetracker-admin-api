module.exports = {
    config: {
        "vhosts": {
            "test": {
                "connection": {
                    "url": process.env.RABBIT_MQ_URL,
                    "socketOptions": {
                        "timeout": 1000
                    }
                },
                "exchanges": ["admin-verifications"],
                "queues": ["field-data:verifications"],
                "bindings": [
                    "admin-verifications -> field-data:verifications"
                ],
                "publications": {
                    "admin-verification": {
                        "exchange": "admin-verifications"
                    }
                }
            }
        }
    }
}