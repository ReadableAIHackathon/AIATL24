// app/api/books/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const queryString = new URLSearchParams({}).toString();
    const response = await fetch(`https://readablemongo.teje.sh/records/get?${queryString}`, {
      method: 'GET',
      headers: {
        'authorization': process.env.NEXT_PUBLIC_DB_API // Note: no NEXT_PUBLIC_ prefix needed here
      }
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}