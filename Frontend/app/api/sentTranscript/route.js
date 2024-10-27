import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@app/api/auth/[...nextauth]/route';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        if (!data.transcript) {
            return NextResponse.json(
                { error: 'No transcript provided' },
                { status: 400 }
            );
        }

        console.log("Sending Data:", JSON.stringify({
            UserEmail: session.user.email,
            TranscribedText: data.transcript,
            ExpectedText: data.expected_text,
            Level: data.level,
            Duration: data.duration
        }));

        const response = await fetch(`https://readablemongo.teje.sh/user/transcript`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': process.env.NEXT_PUBLIC_DB_API
            },
            body: JSON.stringify({
                UserEmail: session.user.email,
                TranscribedText: data.transcript,
                ExpectedText: data.expected_text,
                Level: data.level,
                Duration: data.duration
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API responded with status: ${response.status}, error: ${errorText}`);
            return NextResponse.json({ error: `Failed to update data: ${errorText}` }, { status: 500 });
        }

        const result = await response.json();
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Failed to update:", error.message || error);
        return NextResponse.json(
            { error: 'Failed to update data' },
            { status: 500 }
        );
    }
}
