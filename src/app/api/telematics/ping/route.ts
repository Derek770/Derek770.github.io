import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TelematicsPingPayload } from '@/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TelematicsPingPayload;

    const { device_id, lat, lng, speed, ignition, timestamp } = body;

    // Validate incoming payload
    if (!device_id || lat === undefined || lng === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required telematics fields: device_id, lat, and lng are mandatory.',
        },
        { status: 400 }
      );
    }

    const result = db.ingestTelematics({
      device_id,
      lat: Number(lat),
      lng: Number(lng),
      speed: Number(speed ?? 0),
      ignition: Boolean(ignition),
      timestamp: timestamp || new Date().toISOString(),
      heading: body.heading,
    });

    if (!result.success || !result.vehicle) {
      return NextResponse.json(
        {
          success: false,
          error: `No vehicle mapped to device_id or registration: ${device_id}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Telematics ping ingested successfully',
      data: {
        vehicle_id: result.vehicle.id,
        plate_number: result.vehicle.plate_number,
        status: result.vehicle.status,
        last_location: result.vehicle.last_location,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
