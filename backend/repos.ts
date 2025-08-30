import { getDb } from "./mongo"
import { hashPassword, verifyPassword } from "./auth"

export type Role = "producer" | "buyer" | "regulator"

export type Batch = {
  _id?: any
  batchId: string
  unitsKg: number
  productionDate: string
  producerUsername: string
  createdAt: string
  buyerUsername?: string
  purchaseDate?: string
}

const USERS = {
  producer: "producers",
  buyer: "buyers",
  regulator: "regulators",
}
const BATCHES = "hydrogen_batches"

export async function ensureDefaultUsers() {
  const db = await getDb()
  for (const [role, coll] of Object.entries(USERS)) {
    const count = await db.collection(coll).countDocuments({})
    if (count === 0) {
      const username = role as Role
      const pwd = `${role}123`
      await db.collection(coll).insertOne({
        username,
        passwordHash: await hashPassword(pwd),
        createdAt: new Date().toISOString(),
      })
    }
  }
}

export async function findUser(role: Role, username: string) {
  const db = await getDb()
  return db.collection(USERS[role]).findOne({ username })
}

export async function authenticateAnyRole(username: string, password: string) {
  const db = await getDb()
  // Try each role collection
  for (const [roleKey, coll] of Object.entries(USERS)) {
    const user = await db.collection(coll).findOne({ username })
    if (user && user.passwordHash && (await verifyPassword(password, user.passwordHash))) {
      return { role: roleKey as Role, username }
    }
  }
  return null
}

export async function createBatch(input: {
  batchId: string
  unitsKg: number
  productionDate: string
  producerUsername: string
}) {
  const db = await getDb()
  const doc: Batch = {
    batchId: input.batchId,
    unitsKg: input.unitsKg,
    productionDate: input.productionDate,
    producerUsername: input.producerUsername,
    createdAt: new Date().toISOString(),
  }
  await db.collection(BATCHES).createIndex({ batchId: 1 }, { unique: true })
  await db.collection(BATCHES).insertOne(doc)
  return doc
}

export async function listBatches(scope: "available" | "purchased" | "mine" | "all", username?: string, role?: Role) {
  const db = await getDb()
  let query: any = {}
  if (scope === "available") query = { buyerUsername: { $exists: false } }
  if (scope === "purchased") query = { buyerUsername: username }
  if (scope === "mine" && role === "producer") query = { producerUsername: username }
  const items = await db
    .collection(BATCHES)
    .find(scope === "all" ? {} : query)
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray()
  return items
}

export async function buyBatch(batchId: string, buyerUsername: string) {
  const db = await getDb()
  const updated = await db
    .collection(BATCHES)
    .findOneAndUpdate(
      { batchId, buyerUsername: { $exists: false } },
      { $set: { buyerUsername, purchaseDate: new Date().toISOString() } },
      { returnDocument: "after" },
    )
  return updated.value
}

export async function listTransactions() {
  const db = await getDb()
  const batches = await db.collection(BATCHES).find({}).sort({ createdAt: -1 }).limit(300).toArray()
  const tx = batches.flatMap((b: any) => {
    const prod = {
      _id: `${b._id}-prod`,
      type: "production",
      producerUsername: b.producerUsername,
      buyerUsername: null,
      batchId: b.batchId,
      unitsKg: b.unitsKg,
      timestamp: b.createdAt,
    }
    const arr: any[] = [prod]
    if (b.buyerUsername) {
      arr.push({
        _id: `${b._id}-buy`,
        type: "purchase",
        producerUsername: b.producerUsername,
        buyerUsername: b.buyerUsername,
        batchId: b.batchId,
        unitsKg: b.unitsKg,
        timestamp: b.purchaseDate || b.createdAt,
      })
    }
    return arr
  })
  return tx
}
