import { Router, Request, Response } from 'express';
import { generateMultimodalOptions, calculateHaversineDistanceKm } from '@fairride/shared';

export const locationRouter = Router();

const SAMPLE_PLACES = [
  {
    id: 'place_cyber_towers',
    name: 'Cyber Towers, Hitech City',
    address: 'Hitech City Main Rd, Patrika Nagar, HITEC City, Hyderabad, Telangana 500081',
    coordinates: [78.3811, 17.4474] as [number, number],
    city: 'Hyderabad',
    pickupPoints: [
      { type: 'GATE', label: 'Main Security Gate 1', coordinates: [78.3811, 17.4474] },
      { type: 'METRO_EXIT', label: 'Hitech City Metro Station Exit B', coordinates: [78.3820, 17.4480] },
      { type: 'PARKING', label: 'Cyber Towers Visitor Parking P2', coordinates: [78.3805, 17.4468] }
    ]
  },
  {
    id: 'place_rgia_airport',
    name: 'Rajiv Gandhi International Airport (RGIA)',
    address: 'Shamshabad, Hyderabad, Telangana 500409',
    coordinates: [78.4298, 17.2403] as [number, number],
    city: 'Hyderabad',
    pickupPoints: [
      { type: 'AIRPORT_TERMINAL', label: 'Terminal 1 - Arrivals Pillar 6', coordinates: [78.4298, 17.2403] },
      { type: 'AIRPORT_TERMINAL', label: 'Terminal 2 - Express Pickup Lane', coordinates: [78.4312, 17.2415] },
      { type: 'PARKING', label: 'Commercial Cab Zone P4', coordinates: [78.4285, 17.2390] }
    ]
  },
  {
    id: 'place_inorbit_mall',
    name: 'Inorbit Mall Cyberabad',
    address: 'S No. 64, Inorbit Mall Rd, Software Units Layout, Vittal Rao Nagar, Madhapur, Hyderabad, Telangana 500081',
    coordinates: [78.3872, 17.4354] as [number, number],
    city: 'Hyderabad',
    pickupPoints: [
      { type: 'MALL_ENTRANCE', label: 'West Entrance Porch', coordinates: [78.3872, 17.4354] },
      { type: 'GATE', label: 'Durgam Cheruvu Lake View Gate', coordinates: [78.3880, 17.4348] },
      { type: 'PARKING', label: 'Basement Valet Counter B1', coordinates: [78.3865, 17.4350] }
    ]
  },
  {
    id: 'place_secunderabad_station',
    name: 'Secunderabad Railway Station',
    address: 'Station Rd, Railway Colony, Chilakalguda, Secunderabad, Telangana 500025',
    coordinates: [78.5029, 17.4344] as [number, number],
    city: 'Hyderabad',
    pickupPoints: [
      { type: 'GATE', label: 'Platform 1 Main Portico (North Gate)', coordinates: [78.5029, 17.4344] },
      { type: 'GATE', label: 'Platform 10 Bhoiguda Portico (South Gate)', coordinates: [78.5042, 17.4330] },
      { type: 'METRO_EXIT', label: 'Secunderabad West Metro Station Exit A', coordinates: [78.5015, 17.4352] }
    ]
  },
  {
    id: 'place_aiims_hospital',
    name: 'AIG Hospitals, Gachibowli',
    address: 'Plot No 2/3/4/5, Mindspace Rd, Gachibowli, Hyderabad, Telangana 500032',
    coordinates: [78.3638, 17.4375] as [number, number],
    city: 'Hyderabad',
    pickupPoints: [
      { type: 'HOSPITAL_ENTRANCE', label: 'Emergency & Trauma Reception', coordinates: [78.3638, 17.4375] },
      { type: 'MAIN_ENTRANCE', label: 'Tower A Outpatient Lobby Drop-off', coordinates: [78.3645, 17.4380] },
      { type: 'GATE', label: 'Gachibowli Main Boulevard Gate', coordinates: [78.3630, 17.4370] }
    ]
  },
  {
    id: 'place_iiit_hyderabad',
    name: 'IIIT Hyderabad Campus',
    address: 'Gachibowli, Hyderabad, Telangana 500032',
    coordinates: [78.3498, 17.4455] as [number, number],
    city: 'Hyderabad',
    pickupPoints: [
      { type: 'COLLEGE_GATE', label: 'Main Security Gate (Vindhya Canteen)', coordinates: [78.3498, 17.4455] },
      { type: 'GATE', label: 'OBH Hostel Rear Gate', coordinates: [78.3512, 17.4462] }
    ]
  }
];

/**
 * Places search with smart pickup points
 */
locationRouter.get('/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  if (!query) {
    res.json({ success: true, data: SAMPLE_PLACES.slice(0, 5) });
    return;
  }

  let results = SAMPLE_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query) ||
      p.city.toLowerCase().includes(query)
  );

  if (results.length === 0) {
    try {
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
        { headers: { 'User-Agent': 'FairRide-Mobility-Platform/1.0' } }
      );
      if (nomRes.ok) {
        const nomData: any = await nomRes.json();
        results = nomData.map((item: any, idx: number) => ({
          id: `place_osm_${idx}_${item.place_id}`,
          name: item.display_name.split(',')[0],
          address: item.display_name,
          coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
          city: 'Hyderabad',
          pickupPoints: [
            { type: 'GATE', label: 'Main Entrance Gate', coordinates: [parseFloat(item.lon), parseFloat(item.lat)] },
            { type: 'PARKING', label: 'Curbside Drop-off', coordinates: [parseFloat(item.lon), parseFloat(item.lat)] }
          ]
        }));
      }
    } catch {
      // Fallback gracefully
    }
  }

  res.json({ success: true, data: results });
});

/**
 * Get Multimodal transit alternatives
 */
locationRouter.post('/multimodal-plan', (req: Request, res: Response) => {
  const { originCoords, destinationCoords, originName, destinationName } = req.body;
  if (!originCoords || !destinationCoords) {
    res.status(400).json({ success: false, message: 'Origin and destination coordinates required' });
    return;
  }

  const distanceKm = calculateHaversineDistanceKm(originCoords, destinationCoords);
  const options = generateMultimodalOptions(
    originName || 'Pickup Location',
    destinationName || 'Destination',
    distanceKm
  );

  res.json({
    success: true,
    data: {
      distanceKm,
      options
    }
  });
});
