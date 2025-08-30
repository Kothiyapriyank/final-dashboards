import { MongoClient, type Db } from "mongodb"

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined
}

const uri = process.env.MONGODB_URI as string
if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable")
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!global.__mongoClientPromise) {
  client = new MongoClient(uri, {})
  global.__mongoClientPromise = client.connect()
}
clientPromise = global.__mongoClientPromise

export async function getDb(): Promise<Db> {
  const client = await clientPromise
  return client.db() // default database from URI
}
