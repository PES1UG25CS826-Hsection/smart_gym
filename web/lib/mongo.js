import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function getDb() {
  globalThis.__gymMongo ??= new MongoClient(process.env.MONGODB_URI).connect();
  const client = await globalThis.__gymMongo;
  return client.db(process.env.MONGODB_DB);
}

export function toObjectId(id) {
  return typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : null;
}

// 121 = rejected by the collection's JSON-schema validator, 11000 = duplicate key
export function mongoError(err) {
  console.error(err);
  if (err.code === 121) return NextResponse.json({ error: 'Some values are not valid. Please check your entries.' }, { status: 400 });
  if (err.code === 11000) return NextResponse.json({ error: 'That entry already exists' }, { status: 409 });
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
}
