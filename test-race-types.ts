// Test script to fetch all endpoints for Trot and Obstacle races
// import fetch from 'node-fetch';
import * as fs from 'fs';

const baseUrl = "https://api.equidia.fr";
const headers = {
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "accept": "application/json, text/plain, */*",
  "accept-language": "en-US,en;q=0.9",
  "content-type": "application/json",
  "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  "referrer": "https://www.equidia.fr/",
  "origin": "https://www.equidia.fr"
};

async function fetchEndpoint(url: string, name: string) {
  try {
    const response = await fetch(url, { 
      headers:headers, 
      referrer: "https://www.equidia.fr/" 
    });
    const data = await response.json();
    console.log(`  ✅ ${name}`);
    return data;
  } catch (error: any) {
    console.log(`  ❌ ${name}: ${error.message}`);
    return null;
  }
}

async function testAllEndpoints(date: string, reunion: string, course: string, type: string) {
  console.log(`\n=== ${type}: ${date}/${reunion}/${course} ===`);
  
  const results: any = { type, date, reunion, course };
  
  // Course details
  results.courseDetails = await fetchEndpoint(
    `${baseUrl}/api/public/courses/${date}/${reunion}/${course}`,
    'Course Details'
  );
  
  // Pronostic
  results.pronostic = await fetchEndpoint(
    `${baseUrl}/api/public/courses/${date}/${reunion}/${course}/pronostic`,
    'Pronostic'
  );
  
  // Notes
  results.notes = await fetchEndpoint(
    `${baseUrl}/api/public/courses/${date}/${reunion}/${course}/note`,
    'Notes'
  );
  
  // Pari Simple
  results.pariSimple = await fetchEndpoint(
    `${baseUrl}/api/public/courses/${date}/${reunion}/${course}/pari-simple`,
    'Pari Simple'
  );
  
  // References
  results.references = await fetchEndpoint(
    `${baseUrl}/api/public/courses/${date}/${reunion}/${course}/references`,
    'References'
  );
  results.notule =  await fetchEndpoint(
    `${baseUrl}/api/public/courses/${date}/${reunion}/${course}/notule`,
    'Notule'
  );
  // Sample horse data (first runner)
  if (results.courseDetails?.partants?.[0]) {
    const horseSlug = results.courseDetails.partants[0].cheval.slug;
    console.log(`\n  Testing horse: ${horseSlug}`);
    
    results.horseHistory = await fetchEndpoint(
      `${baseUrl}/api/public/chevaux/${horseSlug}/historique?range=[0,9]`,
      'Horse History'
    );
    
    results.horseStats = await fetchEndpoint(
      `${baseUrl}/api/public/chevaux/${horseSlug}/stats`,
      'Horse Stats'
    );
  }
  
  // Save to file
  const filename = `race-${type.toLowerCase()}-${date}-${reunion}-${course}.json`;
  fs.writeFileSync(filename, JSON.stringify(results, null, 2));
  console.log(`\n  💾 Saved to ${filename}`);
  
  // Print key differences
  if (results.courseDetails) {
    console.log(`\n  📊 Key Info:`);
    console.log(`     Discipline: ${results.courseDetails.discipline}`);
    console.log(`     Distance: ${results.courseDetails.distance}m`);
    console.log(`     Ground: ${results.courseDetails.etat_terrain}`);
    console.log(`     Runners: ${results.courseDetails.partants?.length || 0}`);
    console.log(`     Sample Music: ${results.courseDetails.partants?.[0]?.cheval?.musique || 'N/A'}`);
  }
  
  return results;
}
async function testTracking(){
  const response = await fetchEndpoint(`https://api.equidia.fr/api/public/courses/2025-12-02/R1/C4/notule`,'Race Tracking')
  console.log(JSON.stringify(response))
}

async function main() {
  // Test Obstacle race
  // await testAllEndpoints('2025-12-15', 'R1', 'C1', 'Obstacle');
  
  // Test Trot race
  // await testAllEndpoints('2025-12-15', 'R2', 'C1', 'Trot');
  await testTracking()
  console.log('\n✅ All tests complete. Check JSON files for full data.');
}

main();
