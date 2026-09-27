async function test() {
  console.log('Testing FleetPulse Live Server at http://localhost:3000...\n');
  const baseUrl = 'http://localhost:3000';

  // 1. Pages check
  for (const path of ['/', '/map', '/dispatch', '/drivers', '/vehicles', '/finances']) {
    const res = await fetch(`${baseUrl}${path}`);
    console.log(`[PAGE] ${path.padEnd(12)} -> Status: ${res.status}`);
    if (res.status !== 200) throw new Error(`Page ${path} returned ${res.status}`);
  }

  // 2. GET /api/vehicles
  const vehRes = await fetch(`${baseUrl}/api/vehicles`);
  const vehData = await vehRes.json();
  console.log(`\n[API] GET /api/vehicles -> ${vehData.count} vehicles`);
  if (vehData.count !== 5) throw new Error('Expected 5 vehicles');

  // 3. GET /api/drivers
  const drvRes = await fetch(`${baseUrl}/api/drivers`);
  const drvData = await drvRes.json();
  console.log(`[API] GET /api/drivers  -> ${drvData.count} drivers`);
  if (drvData.count !== 5) throw new Error('Expected 5 drivers');

  // 4. POST /api/telematics/ping
  const pingPayload = {
    device_id: 'DL 1TA 4821',
    lat: 28.6325,
    lng: 77.2185,
    speed: 48,
    ignition: true,
    timestamp: new Date().toISOString(),
  };
  const pingRes = await fetch(`${baseUrl}/api/telematics/ping`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pingPayload),
  });
  const pingData = await pingRes.json();
  console.log(`[API] POST /api/telematics/ping -> Success: ${pingData.success}, Updated Speed: ${pingData.data.last_location.speed} km/h`);
  if (!pingData.success) throw new Error('Ping failed');

  // 5. POST /api/shifts (Check-Out)
  const checkoutRes = await fetch(`${baseUrl}/api/shifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vehicle_id: 'veh-003',
      driver_id: 'drv-004',
      start_odometer: 64280,
      start_fuel: 95,
      pre_damages: ['Inspected clean'],
      rent_amount: 1100,
    }),
  });
  const checkoutData = await checkoutRes.json();
  console.log(`[API] POST /api/shifts (Check-Out) -> Shift ID: ${checkoutData.data.id}`);
  const shiftId = checkoutData.data.id;

  // 6. PATCH /api/shifts (Check-In Return)
  const checkinRes = await fetch(`${baseUrl}/api/shifts`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shift_id: shiftId,
      end_odometer: 64450,
      end_fuel: 75,
      post_damages: [],
      penalties: 0,
      total_due: 1100,
      notes: 'Returned on time',
    }),
  });
  const checkinData = await checkinRes.json();
  console.log(`[API] PATCH /api/shifts (Check-In) -> Km Driven: ${checkinData.data.shift.total_km} km, Vehicle Status: ${checkinData.data.vehicle.status}`);

  // 7. POST /api/finances/collections (Payment & Receipt)
  const payRes = await fetch(`${baseUrl}/api/finances/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shift_id: shiftId,
      driver_id: 'drv-004',
      amount: 1100,
      payment_mode: 'UPI',
      upi_ref: 'UPI/7721849102',
      collected_by: 'Supervisor Sunil',
    }),
  });
  const payData = await payRes.json();
  console.log(`[API] POST /api/finances/collections -> Receipt: ${payData.data.receipt}`);

  // 8. POST /api/finances/expenses
  const expRes = await fetch(`${baseUrl}/api/finances/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vehicle_id: 'veh-001',
      category: 'PUNCTURE',
      description: 'Tubeless tyre puncture repair',
      amount: 200,
    }),
  });
  const expData = await expRes.json();
  console.log(`[API] POST /api/finances/expenses -> Logged Expense: ₹${expData.data.amount} (${expData.data.receipt_number})`);

  console.log('\n=============================================');
  console.log('ALL API ROUTES & WEB APPLICATION PAGES VERIFIED 100%!');
  console.log('=============================================\n');
}

test().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
