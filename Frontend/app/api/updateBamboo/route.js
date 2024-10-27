// app/api/updateBamboo/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@app/api/auth/[...nextauth]/route';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newPandaSize, currentBamboo } = await req.json();

    const response = await fetch(`https://readablemongo.teje.sh/user/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': process.env.NEXT_PUBLIC_DB_API
      },
      body: JSON.stringify({
        UserEmail: session.user.email,
        Bamboo: currentBamboo,
        PandaSize: newPandaSize
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Failed to update user data');
    }

    return NextResponse.json({
      success: true,
      bamboo: data.Bamboo,
      pandaSize: data.PandaSize
    });

  } catch (error) {
    console.error("Failed to update:", error);
    return NextResponse.json(
      { error: 'Failed to update data' },
      { status: 500 }
    );
  }
}