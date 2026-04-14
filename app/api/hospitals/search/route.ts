import { getServerDb } from '@/lib/supabase-server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const department = searchParams.get('department');
    const is24h = searchParams.get('is24h');
    const search = searchParams.get('search');

    const db = await getServerDb();

    let query = db
      .from('hospitals')
      .select('*')
      .eq('is_partner', true)
      .eq('is_active', true);

    if (department) {
      query = query.contains('departments', [department]);
    }

    if (is24h === 'true') {
      query = query.eq('is_24h', true);
    }

    if (search) {
      const escaped = search.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
      query = query.or(`name.ilike.%${escaped}%,address.ilike.%${escaped}%`);
    }

    const { data: hospitals, error } = await query;

    if (error) {
      console.error('Hospital search error:', error);
      return Response.json({ error: '병원 검색 중 오류가 발생했습니다.' }, { status: 500 });
    }

    let results = hospitals || [];

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      if (isNaN(userLat) || isNaN(userLng) || userLat < -90 || userLat > 90 || userLng < -180 || userLng > 180) {
        return Response.json({ error: '유효하지 않은 좌표입니다.' }, { status: 400 });
      }

      results = results.map(h => ({
        ...h,
        distance: h.latitude && h.longitude
          ? calculateDistance(userLat, userLng, parseFloat(h.latitude), parseFloat(h.longitude))
          : null
      }));

      results.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    return Response.json({ hospitals: results });
  } catch (error) {
    console.error('Hospital search error:', error);
    return Response.json({ error: '병원 검색 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
