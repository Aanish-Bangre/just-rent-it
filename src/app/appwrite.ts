import { Client, Account, ID  } from "appwrite";

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('687e5171003457e6fcd7'); // Your project ID
    

export const account = new Account(client);
export { ID };
