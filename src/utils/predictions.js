/**
 * FieldCast AI — Demonstration Prediction Engine
 *
 * All outputs are structured demonstration estimates based on heuristic rules.
 * They are clearly labelled as such and are NOT validated AI predictions.
 * This module is designed to be replaced with a real model backend.
 */

// ---------- Shared utilities ----------

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val))
}

function scoreToLabel(score) {
  if (score >= 85) return { label: 'Excellent', color: 'green' }
  if (score >= 70) return { label: 'Good', color: 'sky' }
  if (score >= 50) return { label: 'Fair', color: 'amber' }
  if (score >= 30) return { label: 'Poor', color: 'orange' }
  return { label: 'Very Poor', color: 'red' }
}

function riskToLabel(risk) {
  if (risk <= 15) return { label: 'Low Risk', color: 'green' }
  if (risk <= 35) return { label: 'Moderate Risk', color: 'amber' }
  if (risk <= 60) return { label: 'High Risk', color: 'orange' }
  return { label: 'Very High Risk', color: 'red' }
}

// ---------- TrailGuard ----------
export function predictTrailGuard(data) {
  let difficulty = 30
  let riskPts = 10

  const dist = parseFloat(data.distance_km) || 10
  const elev = parseFloat(data.elevation_gain) || 300

  difficulty += clamp(dist * 1.5, 0, 25)
  difficulty += clamp(elev / 80, 0, 30)

  const surfaceMap = {
    'Paved path': 0, 'Gravel / dirt track': 8, 'Rocky terrain': 18,
    'Off-trail / scramble': 28, 'Snow / ice': 35
  }
  difficulty += surfaceMap[data.surface_type] || 0

  const fitnessOffset = { Beginner: 20, Intermediate: 0, Advanced: -10, Expert: -18 }
  difficulty += fitnessOffset[data.fitness_level] || 0

  const rainRisk = { None: 0, 'Light (< 5mm)': 5, 'Moderate (5–25mm)': 15, 'Heavy (> 25mm)': 30 }
  riskPts += rainRisk[data.recent_rain] || 0

  const winterBonus = data.season?.includes('Winter') ? 15 : 0
  difficulty += winterBonus
  riskPts += winterBonus * 0.8

  const group = parseInt(data.group_size) || 2
  if (group === 1) riskPts += 10

  difficulty = clamp(Math.round(difficulty), 0, 100)
  riskPts = clamp(Math.round(riskPts), 0, 100)

  const diffLabel = difficulty < 40 ? 'Moderate' : difficulty < 65 ? 'Challenging' : difficulty < 80 ? 'Strenuous' : 'Extreme'

  const gear = []
  if (elev > 500) gear.push('Trekking poles recommended')
  if (data.surface_type === 'Snow / ice') gear.push('Microspikes or crampons')
  if (data.recent_rain !== 'None') gear.push('Waterproof boots & jacket')
  if (dist > 20) gear.push('High-calorie emergency food')
  if (group === 1) gear.push('Share your route with someone')
  gear.push('Navigation app or paper map')
  gear.push('First aid kit')

  const alternatives = []
  if (difficulty > 70) alternatives.push({ label: 'Shorter variant', note: `Cut ${Math.round(dist * 0.3)} km — reduces difficulty to ~${Math.round(difficulty * 0.72)}%` })
  if (data.recent_rain !== 'None') alternatives.push({ label: 'Wait 2 days', note: 'Surface conditions should improve significantly' })

  return {
    moduleId: 'trailguard',
    type: 'demo',
    headline: `${diffLabel} Route`,
    score: 100 - difficulty,
    scoreLabel: riskToLabel(riskPts),
    metrics: [
      { label: 'Difficulty Index', value: `${difficulty}/100`, note: diffLabel },
      { label: 'Route Risk', value: riskToLabel(riskPts).label },
      { label: 'Est. Duration', value: `${Math.round((dist / 3.2) * (1 + elev / 2000) * 10) / 10} hrs` },
      { label: 'Group Factor', value: group === 1 ? 'Solo — elevated risk' : `${group} people` },
    ],
    factors: [
      { label: 'Terrain surface', impact: surfaceMap[data.surface_type] > 15 ? 'negative' : 'neutral', text: data.surface_type },
      { label: 'Fitness match', impact: (fitnessOffset[data.fitness_level] || 0) < -5 ? 'positive' : 'neutral', text: data.fitness_level },
      { label: 'Rainfall effect', impact: riskPts > 20 ? 'negative' : 'positive', text: data.recent_rain || 'None' },
      { label: 'Season', impact: winterBonus > 0 ? 'negative' : 'positive', text: data.season || 'Not specified' },
    ],
    gear,
    alternatives,
    recommendation: riskPts > 50
      ? 'Consider postponing or choosing an easier route given current conditions.'
      : riskPts > 25
        ? 'Proceed with caution — ensure you have the recommended gear and a clear bail-out plan.'
        : 'Conditions look manageable. Start early and keep an eye on the weather.',
  }
}

// ---------- SunCast ----------
export function predictSunCast(data) {
  let score = 50
  const cloudMap = {
    'Clear skies (0–10%)': 90, 'Partly cloudy (10–40%)': 72,
    'Mostly cloudy (40–70%)': 45, 'Overcast (70–100%)': 18,
  }
  const horizonMap = {
    'Open ocean / lake': 95, 'Mountain range': 80, 'Rolling hills': 70,
    'Urban skyline': 55, 'Flat plains': 85,
  }
  score = clamp(
    (cloudMap[data.cloud_cover] || 60) * 0.6 + (horizonMap[data.horizon] || 70) * 0.4,
    0, 100
  )

  const elev = parseFloat(data.viewpoint_elevation) || 0
  if (elev > 300) score = clamp(score + 5, 0, 100)
  if (elev > 1000) score = clamp(score + 5, 0, 100)

  const colorIntensity = cloudMap[data.cloud_cover] > 70 ? 'Muted' : cloudMap[data.cloud_cover] > 40 ? 'Vivid' : 'Moderate — thin cloud can enhance colour'

  const goldenWindowStart = data.event_type === 'Sunrise' ? '06:15' : '18:45'
  const goldenWindowEnd = data.event_type === 'Sunrise' ? '06:55' : '19:25'

  return {
    moduleId: 'suncast',
    type: 'demo',
    headline: scoreToLabel(score).label + ' Sky Potential',
    score,
    scoreLabel: scoreToLabel(score),
    metrics: [
      { label: 'Sky Score', value: `${Math.round(score)}/100` },
      { label: 'Colour Intensity', value: colorIntensity },
      { label: 'Peak Window', value: `${goldenWindowStart} – ${goldenWindowEnd}` },
      { label: 'Cloud Verdict', value: data.cloud_cover || 'Not specified' },
    ],
    factors: [
      { label: 'Cloud cover', impact: (cloudMap[data.cloud_cover] || 60) > 60 ? 'positive' : 'negative', text: data.cloud_cover || 'Unknown' },
      { label: 'Horizon quality', impact: (horizonMap[data.horizon] || 70) > 70 ? 'positive' : 'neutral', text: data.horizon || 'Unknown' },
      { label: 'Elevation advantage', impact: elev > 200 ? 'positive' : 'neutral', text: elev > 0 ? `${elev} m above valley` : 'Low elevation' },
    ],
    alternatives: [
      { label: '30 min earlier', note: 'Catch afterglow and silhouette effect' },
      { label: '30 min later', note: 'Civil twilight — cooler blue tones, quieter location' },
    ],
    recommendation: score > 70
      ? 'Conditions look promising. Arrive 20–30 minutes early and face west (or east for sunrise).'
      : score > 45
        ? 'Moderate potential. The light may break through — worth attending but manage expectations.'
        : 'Low probability of a dramatic display. Consider an alternative date or indoor photography.',
  }
}

// ---------- RunPredictor ----------
export function predictRunPredictor(data) {
  const dist = parseFloat(data.planned_distance) || 10
  const pace = parseFloat(data.target_pace) || 5.5
  const recent5k = parseFloat(data.recent_5k_time) || 28
  const temp = parseFloat(data.temperature) || 18
  const humidity = parseFloat(data.humidity) || 60
  const restDays = parseInt(data.rest_days) || 1

  // Implied VO2max-adjusted threshold pace
  const threshold5kPace = recent5k / 5
  const marathonEquiv = threshold5kPace * 1.25
  const halfEquiv = threshold5kPace * 1.12

  let sustainability = 70
  const paceRatio = pace / threshold5kPace
  if (paceRatio < 0.85) sustainability -= 35  // too fast
  else if (paceRatio < 1.0) sustainability -= 15
  else if (paceRatio <= 1.2) sustainability += 10
  else if (paceRatio <= 1.4) sustainability += 5
  else sustainability -= 5

  // Distance factor
  if (dist > 21) sustainability -= 10
  if (dist > 30) sustainability -= 10

  // Environmental stress
  if (temp > 25) sustainability -= (temp - 25) * 2
  if (temp < 0) sustainability -= 10
  if (humidity > 75) sustainability -= 8

  // Recovery
  if (restDays === 0) sustainability -= 12
  else if (restDays >= 2) sustainability += 5

  sustainability = clamp(Math.round(sustainability), 0, 100)

  const finishTime = dist * pace
  const hrs = Math.floor(finishTime / 60)
  const mins = Math.round(finishTime % 60)

  const terrainPenalty = {
    'Flat road / track': 0, 'Rolling hills': '+8 sec/km', 'Hilly trail': '+18 sec/km',
    'Beach / sand': '+22 sec/km', 'Treadmill': '-3 sec/km',
  }

  return {
    moduleId: 'runpredictor',
    type: 'demo',
    headline: sustainability > 65 ? 'Pace Appears Achievable' : sustainability > 40 ? 'Borderline — Manage Carefully' : 'Pace May Be Unsustainable',
    score: sustainability,
    scoreLabel: scoreToLabel(sustainability),
    metrics: [
      { label: 'Sustainability Score', value: `${sustainability}/100` },
      { label: 'Est. Finish Time', value: `${hrs > 0 ? hrs + 'h ' : ''}${mins}m` },
      { label: 'Threshold 5 km Pace', value: `${threshold5kPace.toFixed(1)} min/km` },
      { label: 'Terrain Adjustment', value: terrainPenalty[data.terrain] || '0 sec/km' },
    ],
    factors: [
      { label: 'Pace vs fitness', impact: paceRatio < 0.9 ? 'negative' : paceRatio > 1.1 ? 'positive' : 'neutral', text: `${(paceRatio * 100).toFixed(0)}% of threshold pace` },
      { label: 'Heat stress', impact: temp > 22 ? 'negative' : 'positive', text: `${temp}°C / ${humidity}% humidity` },
      { label: 'Recovery', impact: restDays >= 2 ? 'positive' : restDays === 0 ? 'negative' : 'neutral', text: `${restDays} rest day(s) before run` },
      { label: 'Route terrain', impact: data.terrain?.includes('Flat') ? 'positive' : 'neutral', text: data.terrain || 'Unknown' },
    ],
    alternatives: [
      { label: 'Conservative pace', note: `${(pace + 0.5).toFixed(1)} min/km — score improves to ~${clamp(sustainability + 12, 0, 100)}` },
      { label: 'Shorter distance', note: `${Math.round(dist * 0.7)} km — keeps intensity manageable` },
    ],
    recommendation: sustainability > 65
      ? 'Your plan looks solid. Hydrate well, start conservatively, and trust your training.'
      : sustainability > 40
        ? 'Consider going out 30 sec/km slower for the first third. Adjust based on how you feel.'
        : 'High risk of bonking or injury. Reduce pace, shorten the route, or improve recovery before the run.',
  }
}

// ---------- TrailReturn ----------
export function predictTrailReturn(data) {
  const dist = parseFloat(data.total_distance) || 14
  const elev = parseFloat(data.elevation_gain) || 600
  const pace = parseFloat(data.base_pace) || 15  // min/km
  const breaks = parseInt(data.rest_breaks) || 3
  const breakDur = parseInt(data.break_duration) || 10

  // Naismith's Rule adjusted
  const flatTime = dist * pace
  const elevTime = (elev / 10) * 1.5  // 10m elev ≈ 1.5 min
  const breakTime = breaks * breakDur
  const totalMins = Math.round(flatTime + elevTime + breakTime)

  const hrs = Math.floor(totalMins / 60)
  const mins = totalMins % 60

  // Daylight check
  const startTime = data.start_time || '08:00'
  const [sh, sm] = startTime.split(':').map(Number)
  const startMinutes = sh * 60 + sm

  const daylightEnds = { Spring: 19 * 60 + 45, Summer: 21 * 60, Autumn: 17 * 60 + 30, Winter: 16 * 60 }
  const sunset = daylightEnds[data.season] || 19 * 60
  const returnMinutes = startMinutes + totalMins
  const returnHr = Math.floor(returnMinutes / 60) % 24
  const returnMin = returnMinutes % 60
  const returnStr = `${String(returnHr).padStart(2,'0')}:${String(returnMin).padStart(2,'0')}`

  const daylightBuffer = sunset - returnMinutes
  const daylightOk = daylightBuffer > 0

  return {
    moduleId: 'trailreturn',
    type: 'demo',
    headline: daylightOk ? `Return by ${returnStr} ✓` : `⚠️ Risk of Returning After Dark`,
    score: daylightOk ? clamp(90 - Math.abs(daylightBuffer) / 5, 40, 98) : 20,
    scoreLabel: daylightOk ? { label: 'On Track', color: 'green' } : { label: 'Timing Risk', color: 'orange' },
    metrics: [
      { label: 'Estimated Duration', value: `${hrs}h ${mins}m` },
      { label: 'Estimated Return', value: returnStr },
      { label: 'Sunset / End of Light', value: `${Math.floor(sunset / 60)}:${String(sunset % 60).padStart(2,'0')}` },
      { label: 'Daylight Buffer', value: daylightOk ? `${Math.round(daylightBuffer / 60 * 10) / 10} hrs` : 'Negative — headlamp required' },
    ],
    factors: [
      { label: 'Elevation penalty', impact: elev > 800 ? 'negative' : 'neutral', text: `${elev} m gain adds ~${Math.round(elevTime)} min` },
      { label: 'Rest breaks', impact: breaks > 5 ? 'negative' : 'neutral', text: `${breaks} × ${breakDur} min = ${breakTime} min total` },
      { label: 'Season daylight', impact: daylightOk ? 'positive' : 'negative', text: data.season || 'Unknown' },
    ],
    alternatives: [
      { label: 'Start 1 hour earlier', note: `Return by ${String((returnHr - 1 + 24) % 24).padStart(2,'0')}:${String(returnMin).padStart(2,'0')} — ${daylightOk ? 'comfortable buffer' : 'avoids after-dark return'}` },
      { label: 'Reduce breaks to 2', note: `Saves ${(breaks - 2) * breakDur} minutes on the trail` },
    ],
    recommendation: daylightOk
      ? `You should return before dark. Start no later than ${startTime} and stick to your plan.`
      : `Your current plan may result in returning after dark. Start earlier or shorten the route. Always carry a headlamp.`,
  }
}

// ---------- ViewCast ----------
export function predictViewCast(data) {
  const elev = parseFloat(data.elevation) || 500
  const cloudBase = parseFloat(data.cloud_base) || 800
  const wind = parseFloat(data.wind_speed) || 20
  const humidity = parseFloat(data.humidity) || 65

  let vis = 80
  if (cloudBase < elev + 100) vis -= 40  // in cloud
  else if (cloudBase < elev + 300) vis -= 20
  if (humidity > 80) vis -= 10
  if (wind < 5) vis -= 8  // haze
  if (wind > 50) vis -= 5  // turbulence
  if (data.season === 'Winter') vis += 8  // cleaner air
  if (data.season === 'Summer') vis -= 5  // haze

  vis = clamp(Math.round(vis), 0, 100)
  const inCloud = cloudBase < elev + 150

  return {
    moduleId: 'viewcast',
    type: 'demo',
    headline: inCloud ? 'Likely In Cloud — View Obstructed' : scoreToLabel(vis).label + ' Visibility',
    score: vis,
    scoreLabel: scoreToLabel(vis),
    metrics: [
      { label: 'Visibility Score', value: `${vis}/100` },
      { label: 'Cloud Base vs Summit', value: inCloud ? 'Below summit — in cloud' : `${cloudBase - elev} m clearance` },
      { label: 'Humidity Impact', value: humidity > 75 ? 'Haze likely' : 'Acceptable' },
      { label: 'Wind Clarity Factor', value: wind > 20 ? 'Good — wind clears haze' : 'Low wind — possible haze' },
    ],
    factors: [
      { label: 'Cloud base clearance', impact: inCloud ? 'negative' : cloudBase > elev + 500 ? 'positive' : 'neutral', text: `Cloud base ~${cloudBase} m` },
      { label: 'Humidity', impact: humidity > 75 ? 'negative' : 'positive', text: `${humidity}%` },
      { label: 'Wind speed', impact: wind > 15 && wind < 50 ? 'positive' : 'neutral', text: `${wind} km/h` },
    ],
    alternatives: [
      { label: 'Morning visit', note: 'Cloud base often lifts 1–3 hours after sunrise' },
      { label: 'Post-front window', note: 'After a weather front passes, visibility typically improves dramatically' },
    ],
    recommendation: inCloud
      ? 'Summit likely in cloud. Consider waiting for a high-pressure day or visiting in the morning.'
      : vis > 65
        ? 'Conditions look favourable for a good view. Go early for the clearest air.'
        : 'Marginal visibility — the view may be hazy. Worth visiting but temper expectations.',
  }
}

// ---------- RideCast ----------
export function predictRideCast(data) {
  const dist = parseFloat(data.distance_km) || 60
  const elev = parseFloat(data.elevation_gain) || 700
  const wind = parseFloat(data.wind_speed) || 15
  const temp = parseFloat(data.temperature) || 16

  function comfortScore(depTime) {
    let score = 70
    const [h] = (depTime || '08:00').split(':').map(Number)
    if (h >= 6 && h <= 9) score += 10   // cool morning
    if (h >= 11 && h <= 14) score -= 10  // peak heat
    if (temp > 28) score -= 15
    if (temp < 5) score -= 12
    if (wind > 30) score -= 12
    if (elev > 1500) score -= 8
    score += Math.min(dist / 10, 10)
    return clamp(Math.round(score), 0, 100)
  }

  const scoreA = comfortScore(data.departure_time_1)
  const scoreB = comfortScore(data.departure_time_2)
  const bestTime = scoreA >= scoreB ? data.departure_time_1 : data.departure_time_2
  const bestScore = Math.max(scoreA, scoreB)

  const estTime = ((dist / 22) + (elev / 1000)).toFixed(1)

  return {
    moduleId: 'ridecast',
    type: 'demo',
    headline: `Best Departure: ${bestTime || 'Morning'}`,
    score: bestScore,
    scoreLabel: scoreToLabel(bestScore),
    metrics: [
      { label: `Option A (${data.departure_time_1 || '—'})`, value: `${scoreA}/100 comfort` },
      { label: `Option B (${data.departure_time_2 || '—'})`, value: `${scoreB}/100 comfort` },
      { label: 'Est. Ride Time', value: `~${estTime} hrs` },
      { label: 'Wind Impact', value: wind > 20 ? 'Significant headwind risk' : 'Manageable' },
    ],
    factors: [
      { label: 'Temperature', impact: temp > 10 && temp < 26 ? 'positive' : 'negative', text: `${temp}°C` },
      { label: 'Wind', impact: wind < 20 ? 'positive' : 'negative', text: `${wind} km/h` },
      { label: 'Elevation challenge', impact: elev > 1000 ? 'negative' : 'neutral', text: `${elev} m gain` },
    ],
    alternatives: [
      { label: 'Best departure', note: `${bestTime} gives highest comfort score (${bestScore}/100)` },
      { label: 'E-bike option', note: 'Would reduce elevation strain and extend comfortable range by ~40%' },
    ],
    recommendation: bestScore > 65
      ? `Depart at ${bestTime} for the most comfortable ride. Carry a wind layer.`
      : `Conditions are challenging. Consider a shorter route or waiting for better weather.`,
  }
}

// ---------- BirdForecast ----------
const BIRD_DATA = {
  'Woodland / forest': {
    Spring: ['Great Spotted Woodpecker', 'Blue Tit', 'Wood Warbler', 'Blackcap', 'Chiffchaff', 'Nuthatch'],
    Summer: ['Green Woodpecker', 'Garden Warbler', 'Spotted Flycatcher', 'Jay', 'Treecreeper'],
    Autumn: ['Goldcrest', 'Redwing', 'Coal Tit', 'Marsh Tit', 'Lesser Redpoll'],
    Winter: ['Fieldfare', 'Bullfinch', 'Siskin', 'Long-tailed Tit', 'Brambling'],
  },
  'Wetland / marsh': {
    Spring: ['Sedge Warbler', 'Reed Warbler', 'Marsh Harrier', 'Bittern', 'Lapwing'],
    Summer: ['Grey Heron', 'Cormorant', 'Little Egret', 'Water Rail', 'Kingfisher'],
    Autumn: ['Snipe', 'Green Sandpiper', 'Dunlin', 'Black-tailed Godwit', 'Wigeon'],
    Winter: ['Smew', 'Pintail', 'Teal', 'Pochard', 'Hen Harrier'],
  },
  'Coastal / estuary': {
    Spring: ['Oystercatcher', 'Ringed Plover', 'Sandwich Tern', 'Common Tern', 'Whimbrel'],
    Summer: ['Puffin', 'Razorbill', 'Gannet', 'Arctic Tern', 'Curlew'],
    Autumn: ['Knot', 'Turnstone', 'Bar-tailed Godwit', 'Little Stint', 'Brent Goose'],
    Winter: ['Eider', 'Long-tailed Duck', 'Purple Sandpiper', 'Snow Bunting', 'Slavonian Grebe'],
  },
  'Open farmland': {
    Spring: ['Skylark', 'Yellow Wagtail', 'Corn Bunting', 'Yellowhammer', 'Grey Partridge'],
    Summer: ['Turtle Dove', 'Hobby', 'Kestrel', 'Red Kite', 'Common Buzzard'],
    Autumn: ['Golden Plover', 'Lapwing', 'Starling (murmuration)', 'Fieldfare', 'Linnet'],
    Winter: ['Short-eared Owl', 'Merlin', 'Twite', 'Rock Pipit', 'Stock Dove'],
  },
  'Urban park / garden': {
    Spring: ['Robin', 'Blackbird', 'Blue Tit', 'House Sparrow', 'Collared Dove'],
    Summer: ['Swift', 'House Martin', 'Swallow', 'Starling', 'Wren'],
    Autumn: ['Redwing', 'Fieldfare', 'Long-tailed Tit', 'Goldfinch', 'Greenfinch'],
    Winter: ['Redwing', 'Song Thrush', 'Dunnock', 'Pied Wagtail', 'Chaffinch'],
  },
  'Moorland / heathland': {
    Spring: ['Red Grouse', 'Golden Plover', 'Curlew', 'Short-eared Owl', 'Merlin'],
    Summer: ['Meadow Pipit', 'Wheatear', 'Stonechat', 'Peregrine', 'Ring Ouzel'],
    Autumn: ['Pink-footed Goose', 'Dotterel', 'Crossbill', 'Raven', 'Hen Harrier'],
    Winter: ['Snow Bunting', 'Great Grey Shrike', 'Raven', 'Rough-legged Buzzard', 'Waxwing'],
  },
  'Mountain / upland': {
    Spring: ['Ring Ouzel', 'Wheatear', 'Golden Eagle', 'Peregrine', 'Red Kite'],
    Summer: ['Ptarmigan', 'Dotterel', 'Raven', 'Buzzard', 'Kestrel'],
    Autumn: ['Snow Bunting', 'Chough', 'Merlin', 'Fieldfare', 'Redwing'],
    Winter: ['Ptarmigan', 'Snow Bunting', 'Raven', 'Crossbill', 'Crested Tit'],
  },
}

export function predictBirdForecast(data) {
  const habitat = data.habitat || 'Woodland / forest'
  const seasonKey = (data.season || 'Spring').split(' ')[0]
  const species = (BIRD_DATA[habitat]?.[seasonKey] || BIRD_DATA['Urban park / garden']['Spring']).slice(0, 6)

  const timeBonus = data.time_of_day?.includes('Dawn') || data.time_of_day?.includes('Morning') ? 20 : 0
  const duration = parseFloat(data.duration_hours) || 2
  const expOffset = { Beginner: -5, Intermediate: 0, 'Experienced birder': 8 }[data.experience_level] || 0

  const score = clamp(65 + timeBonus + expOffset + Math.min(duration * 3, 12), 0, 100)
  const expectedCount = Math.round(species.length * (score / 100) * (duration / 2))

  return {
    moduleId: 'birdforecast',
    type: 'demo',
    headline: `~${expectedCount}–${expectedCount + 3} Species Likely`,
    score,
    scoreLabel: scoreToLabel(score),
    metrics: [
      { label: 'Activity Score', value: `${Math.round(score)}/100` },
      { label: 'Session Duration', value: `${duration} hrs` },
      { label: 'Peak Time', value: 'Dawn & early morning' },
      { label: 'Habitat Quality', value: habitat },
    ],
    species,
    factors: [
      { label: 'Time of day', impact: timeBonus > 0 ? 'positive' : 'neutral', text: data.time_of_day || 'Unknown' },
      { label: 'Season', impact: seasonKey === 'Spring' || seasonKey === 'Autumn' ? 'positive' : 'neutral', text: data.season || 'Unknown' },
      { label: 'Observer skill', impact: expOffset > 0 ? 'positive' : 'neutral', text: data.experience_level || 'Unknown' },
    ],
    alternatives: [
      { label: 'Dawn visit', note: 'Bird song peaks 30–60 min after sunrise — typically 2× sightings vs midday' },
      { label: 'Migration windows', note: 'Spring (Apr–May) and Autumn (Sep–Oct) offer highest species diversity' },
    ],
    recommendation: score > 70
      ? 'Excellent conditions for birdwatching. Bring binoculars, move quietly, and arrive at dawn.'
      : 'Moderate activity expected. Patience and slow movement will maximise your sightings.',
  }
}

// ---------- GardenEye ----------
export function predictGardenEye(data) {
  const lastWatered = parseInt(data.last_watered) || 2
  const temp = parseFloat(data.temperature) || 22

  let waterUrgency = 30
  const soilFactor = { 'Sandy (drains quickly)': 20, 'Loam (balanced)': 10, 'Clay (retains moisture)': 0, 'Potting mix / container': 15 }
  waterUrgency += soilFactor[data.soil_type] || 10
  waterUrgency += lastWatered * 8
  if (temp > 25) waterUrgency += 15
  if (data.recent_rainfall?.includes('Good') || data.recent_rainfall?.includes('Heavy')) waterUrgency -= 25
  if (data.plant_health?.includes('wilting') || data.plant_health?.includes('stressed')) waterUrgency += 20
  waterUrgency = clamp(Math.round(waterUrgency), 0, 100)

  const tasks = []
  if (waterUrgency > 60) tasks.push({ priority: 'High', task: 'Water thoroughly today' })
  else if (waterUrgency > 35) tasks.push({ priority: 'Medium', task: 'Water within 1–2 days' })
  else tasks.push({ priority: 'Low', task: 'Watering not urgent yet' })

  if (data.plant_health?.includes('Yellowing')) tasks.push({ priority: 'High', task: 'Check for nutrient deficiency or overwatering' })
  if (data.plant_health?.includes('pest')) tasks.push({ priority: 'High', task: 'Inspect for pests — apply treatment if confirmed' })
  if (temp > 28) tasks.push({ priority: 'Medium', task: 'Consider shade cloth during peak afternoon heat' })
  tasks.push({ priority: 'Low', task: 'Remove any dead leaves to improve airflow' })

  return {
    moduleId: 'gardeneye',
    type: 'demo',
    headline: waterUrgency > 60 ? 'Water Today' : waterUrgency > 35 ? 'Water Soon' : 'Moisture OK',
    score: 100 - waterUrgency,
    scoreLabel: waterUrgency > 60 ? { label: 'Urgent', color: 'red' } : waterUrgency > 35 ? { label: 'Soon', color: 'amber' } : { label: 'OK', color: 'green' },
    metrics: [
      { label: 'Water Need Index', value: `${waterUrgency}/100` },
      { label: 'Days Since Watered', value: `${lastWatered} days` },
      { label: 'Soil Retention', value: data.soil_type || 'Unknown' },
      { label: 'Heat Stress', value: temp > 28 ? `High (${temp}°C)` : `Manageable (${temp}°C)` },
    ],
    tasks,
    factors: [
      { label: 'Soil drainage', impact: soilFactor[data.soil_type] > 10 ? 'negative' : 'positive', text: data.soil_type || 'Unknown' },
      { label: 'Days without water', impact: lastWatered > 3 ? 'negative' : 'positive', text: `${lastWatered} days` },
      { label: 'Plant health signal', impact: data.plant_health?.includes('Thriving') ? 'positive' : 'neutral', text: data.plant_health || 'Unknown' },
    ],
    alternatives: [
      { label: 'Mulching', note: 'Apply 5 cm mulch layer to halve water frequency in hot weather' },
      { label: 'Morning watering', note: 'Water at dawn — reduces evaporation by up to 40% vs midday' },
    ],
    recommendation: waterUrgency > 60
      ? 'Your plant needs water urgently. Water deeply at the base, not the leaves.'
      : waterUrgency > 35
        ? 'Plan to water in the next day or two. Check soil moisture with a finger test.'
        : 'Moisture levels appear adequate. Monitor and check again in 2–3 days.',
  }
}

// ---------- CampFuel ----------
export function predictCampFuel(data) {
  const days = parseInt(data.trip_days) || 3
  const group = parseInt(data.group_size) || 4
  const meals = parseFloat(data.hot_meals_per_day) || 2
  const drinks = parseFloat(data.hot_drinks_per_day) || 3
  const temp = parseFloat(data.expected_temp) || 5
  const altitude = parseFloat(data.altitude) || 1500
  const wind = data.wind_exposure || 'Moderate'

  // Base: grams of gas per meal per person
  let gramPerMeal = 18
  let gramPerDrink = 6

  // Temperature adjustment
  if (temp < 0) { gramPerMeal *= 1.4; gramPerDrink *= 1.3 }
  else if (temp < 5) { gramPerMeal *= 1.2; gramPerDrink *= 1.15 }

  // Altitude adjustment
  if (altitude > 3000) { gramPerMeal *= 1.25 }
  else if (altitude > 2000) { gramPerMeal *= 1.12 }

  // Wind adjustment
  const windMult = { Sheltered: 1.0, Moderate: 1.15, 'Exposed / windy': 1.35 }[wind] || 1.15

  gramPerMeal *= windMult
  gramPerDrink *= windMult

  const totalBase = ((meals * gramPerMeal + drinks * gramPerDrink) * group * days)
  const totalWithBuffer = Math.round(totalBase * 1.2)  // 20% safety buffer

  const canisterSizes = [100, 230, 450, 500]
  const recommendedCanisters = canisterSizes.find(s => s >= totalWithBuffer / Math.ceil(group / 4)) || 450

  return {
    moduleId: 'campfuel',
    type: 'demo',
    headline: `~${totalWithBuffer} g Fuel Required`,
    score: 85,
    scoreLabel: { label: 'Calculated', color: 'sky' },
    metrics: [
      { label: 'Base Fuel Need', value: `${Math.round(totalBase)} g` },
      { label: 'With 20% Safety Buffer', value: `${totalWithBuffer} g` },
      { label: 'Recommended Canister', value: `${recommendedCanisters} g canister` },
      { label: 'Canisters Needed', value: `${Math.ceil(totalWithBuffer / recommendedCanisters)} × ${recommendedCanisters}g` },
    ],
    factors: [
      { label: 'Temperature impact', impact: temp < 0 ? 'negative' : 'neutral', text: `${temp}°C nights — ${temp < 0 ? '+40% fuel' : temp < 5 ? '+20% fuel' : 'normal use'}` },
      { label: 'Wind exposure', impact: wind === 'Exposed / windy' ? 'negative' : 'neutral', text: wind },
      { label: 'Altitude effect', impact: altitude > 2000 ? 'negative' : 'neutral', text: `${altitude} m — ${altitude > 3000 ? '+25% fuel' : altitude > 2000 ? '+12% fuel' : 'minimal impact'}` },
    ],
    alternatives: [
      { label: 'Wind shield', note: 'A simple windshield can reduce fuel consumption by 20–30% in exposed conditions' },
      { label: 'Lightweight meals', note: 'Rehydrated meals vs fresh cooking reduces fuel need by ~35%' },
    ],
    recommendation: `Pack ${Math.ceil(totalWithBuffer / recommendedCanisters)} × ${recommendedCanisters}g canisters. Always bring one spare. Use a wind shield to save fuel.`,
  }
}

// ---------- PlanShield ----------
export function predictPlanShield(data) {
  let feasibility = 65

  const expOffset = { 'First-timers': -15, Occasional: 0, 'Regular outdoor enthusiasts': 10, 'Experienced / skilled': 18 }
  feasibility += expOffset[data.group_experience] || 0

  const duration = parseFloat(data.duration_hours) || 5
  if (duration > 10) feasibility -= 10
  if (duration > 16) feasibility -= 15
  if (duration < 3) feasibility += 5

  const hasAlt = data.alt_location && data.alt_location.length > 2
  if (hasAlt) feasibility += 8

  const concerns = (data.concerns || '').toLowerCase()
  if (concerns.includes('knee') || concerns.includes('injury')) feasibility -= 10
  if (concerns.includes('back by') || concerns.includes('deadline')) feasibility -= 5
  if (concerns.includes('experienced') || concerns.includes('prepared')) feasibility += 5

  feasibility = clamp(Math.round(feasibility), 0, 100)

  const risks = []
  if (data.group_experience === 'First-timers') risks.push('Less experienced group — plan simpler routes with clear navigation')
  if (duration > 8) risks.push('Long outing — pack adequate food, water, and emergency kit')
  if (concerns.includes('knee')) risks.push('Injury concern present — consider reduced distance or easier terrain')
  if (!hasAlt) risks.push('No backup location — identify an alternative in case of bad weather')
  risks.push('Always check the weather forecast within 24 hours of departure')

  return {
    moduleId: 'planshield',
    type: 'demo',
    headline: feasibility > 70 ? 'Plan Looks Feasible' : feasibility > 45 ? 'Needs Minor Adjustment' : 'Plan Needs Review',
    score: feasibility,
    scoreLabel: scoreToLabel(feasibility),
    metrics: [
      { label: 'Feasibility Score', value: `${feasibility}/100` },
      { label: 'Activity', value: data.activity_type || 'Not specified' },
      { label: 'Duration', value: `${duration} hrs` },
      { label: 'Backup Plan', value: hasAlt ? data.alt_location : 'None identified' },
    ],
    factors: [
      { label: 'Group experience', impact: (expOffset[data.group_experience] || 0) > 0 ? 'positive' : 'negative', text: data.group_experience || 'Unknown' },
      { label: 'Trip duration', impact: duration > 10 ? 'negative' : 'positive', text: `${duration} hours` },
      { label: 'Alternative location', impact: hasAlt ? 'positive' : 'neutral', text: hasAlt ? data.alt_location : 'Not specified' },
    ],
    risks,
    alternatives: [
      { label: hasAlt ? data.alt_location : 'Nearer backup location', note: hasAlt ? 'Your backup — activate if weather turns' : 'Identify a closer, lower-risk alternative' },
      { label: 'Half-day version', note: `Reduce to ${Math.round(duration / 2)} hours — achievable with less preparation` },
    ],
    recommendation: feasibility > 70
      ? 'Your plan appears well-considered. Finalise logistics, check the forecast the day before, and go enjoy it.'
      : feasibility > 45
        ? 'A few adjustments would improve the plan. Address the flagged risks before committing.'
        : 'Significant gaps in the plan. Work through each risk item and reconsider timing or group readiness.',
  }
}

// ---------- Main dispatcher ----------
export function runPrediction(moduleId, formData) {
  const predictors = {
    trailguard: predictTrailGuard,
    suncast: predictSunCast,
    runpredictor: predictRunPredictor,
    trailreturn: predictTrailReturn,
    viewcast: predictViewCast,
    ridecast: predictRideCast,
    birdforecast: predictBirdForecast,
    gardeneye: predictGardenEye,
    campfuel: predictCampFuel,
    planshield: predictPlanShield,
  }
  const fn = predictors[moduleId]
  if (!fn) throw new Error(`Unknown module: ${moduleId}`)
  return fn(formData)
}
