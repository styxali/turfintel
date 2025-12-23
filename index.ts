import axios from 'axios';
import { RaceReconstructor, StarterInfo, AiAnalysisResponse } from './RaceReconstructor';

const PYTHON_SERVICE_URL = "http://localhost:8000/analyze";

// --- MOCK DATABASE (Replica of your Quinte+ Data) ---
const MOCK_STARTERS: StarterInfo[] = [
    { num_partant: 10, nom_cheval: "VENUS OCEANE", uuid: "5e994520-uuid", casaque_slug: "2025-p10.png" },
    { num_partant: 14, nom_cheval: "LORENZO DE MEDICI", uuid: "3314e8d0-uuid", casaque_slug: "2025-p14.png" },
    { num_partant: 5, nom_cheval: "RIMBAULT", uuid: "35085ba2-uuid", casaque_slug: "2025-p5.png" },
    { num_partant: 9, nom_cheval: "SUPER ALEX", uuid: "b0a38f93-uuid", casaque_slug: "2025-p9.png" },
    { num_partant: 12, nom_cheval: "INCREMENTAL", uuid: "3f2e11f2-uuid", casaque_slug: "2025-p12.png" },
    { num_partant: 13, nom_cheval: "BLACK SAXON", uuid: "6859530a-uuid", casaque_slug: "2025-p13.png" },
    { num_partant: 1, nom_cheval: "VENUS OCEANE1", uuid: "5e9945210-uuid", casaque_slug: "2025-p10.png" },
    { num_partant: 4, nom_cheval: "LORENZO DE MEDICI1", uuid: "3314e81d0-uuid", casaque_slug: "2025-p14.png" },
    { num_partant: 15, nom_cheval: "RIMBAULT1", uuid: "350852b1a2-uuid", casaque_slug: "2025-p5.png" },
    { num_partant: 8, nom_cheval: "SUPER ALEX1", uuid: "b0a3281f93-uuid", casaque_slug: "2025-p9.png" },
    { num_partant: 2, nom_cheval: "INCREMENTAL1", uuid: "3f22e111f2-uuid", casaque_slug: "2025-p12.png" },
    { num_partant: 3, nom_cheval: "BLACK SAXON1", uuid: "685295310a-uuid", casaque_slug: "2025-p13.png" },
    { num_partant: 16, nom_cheval: "RIMBAULT12", uuid: "350825b1a2-uuid", casaque_slug: "2025-p5.png" },
    { num_partant: 6, nom_cheval: "SUPER ALEX12", uuid: "b0a2381f93-uuid", casaque_slug: "2025-p9.png" },
    { num_partant: 7, nom_cheval: "INCREMENTAL12", uuid: "3f22e111f2-uuid", casaque_slug: "2025-p12.png" },
    { num_partant: 11, nom_cheval: "BLACK SAXON12", uuid: "685295310a-uuid", casaque_slug: "2025-p13.png" },
];
const toBBox = (points: number[][]): [number, number, number, number] => {
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    return [
        Math.min(...xs),
        Math.min(...ys),
        Math.max(...xs),
        Math.max(...ys),
    ];
};
    async function main() {
        // 1. INPUT: Video URL
        // const videoSource = "https://private11-stream-ovp.vide.io/dl/1c3066bb9031e314c72d84b4a03ea038/6945549f/equidia_2752987/videos/720p_full_mp4/82/85/S1048285/V1098217/20251219_41282563_00000hr-s1048285-v1098217-720p_full_mp4.mp4?v=0"; //belmonfromage
        //    const videoSource = "https://private11-stream-ovp.vide.io/dl/8090466eaa5d0bf7645356ce5995a43d/69455172/equidia_2752987/videos/720p_full_mp4/82/89/S1048289/V1098221/20251219_41314838_00000hr-s1048289-v1098221-720p_full_mp4.mp4?v=0" //plat
       const videoSource =  "https://private10-stream-ovp.vide.io/dl/c38b57f1b083887d43813e7e0058f8b5/6946d236/equidia_2752987/videos/720p_full_mp4/31/77/S1043177/V1093113/20251202_41314572_00000hr-s1043177-v1093113-720p_full_mp4.mp4?v=0"//plat deauvile
        console.log("1. Sending Video to Python AI Service...");
        // https://www.equidia.fr/courses/2025-12-02/R1/C5 enquete
        const boxesFromPoints = {
            rank_box_1: [
                [239, 843],
                [186, 791],
                [186, 843],
                [239, 791],
            ],
            rank_box_2: [
                [309, 843],
                [309, 791],
                [362, 843],
                [362, 791],
            ],
            // etc...
        };


    try {
        const response = await axios.post<AiAnalysisResponse>(PYTHON_SERVICE_URL, {
            source: videoSource,
            interval_seconds: 5.0,
            extraction_method: "ffmpeg", 
            // start_time:50.0,
            end_time:90.0,

            // --- BOUNDING BOXES (x1, y1, x2, y2) ---
            // Based on width=1400 scaling
            // --- FINAL BOUNDING BOXES [x1, y1, x2, y2] ---

            clock_box: [50, 91, 181, 125],
            ranks_box: [185, 685, 820, 721],
            speed_box: [70, 691, 136, 720],
            distance_box: [1149, 726, 1370, 763],

            // --- INDIVIDUAL HORSE BOXES (1st to 5th) ---
            // Calculated from your data: width x height @ (x, y)
            
            // 1st: 28x28 @ (193, 687)
            rank_box_1: [193, 687, 221, 715],

            // // 2nd: 28x23 @ (253, 689)
            rank_box_2: [253, 689, 281, 712],

            // // 3rd: 28x25 @ (315, 688)
            rank_box_3: [315, 688, 343, 713],

            // 4th: 25x27 @ (376, 690)
            rank_box_4: [376, 690, 401, 717],

            // // 5th: 23x25 @ (440, 692)
            rank_box_5: [440, 692, 463, 717],

            // // 6-11 (NEW)
            // // Format: [x, y, x+w, y+h]
            rank_box_6: [533, 690, 558, 715], // 25x25
            rank_box_7: [584, 691, 609, 716], // 25x25
            rank_box_8: [637, 691, 662, 716], // 25x25
            rank_box_9: [686, 690, 711, 715], // 25x25
            rank_box_10: [738, 691, 763, 716], // 25x25
            rank_box_11: [788, 690, 813, 715]  // 25x25

            // attle belmon fromage
            // rank_box_1: [186, 791, 239, 843],
            // rank_box_2: [309, 791, 362, 843],
            // rank_box_3: [432, 791, 488, 843],
            // distance_box: [1365, 870, 1500, 911], // attle belmon fromage

        });

        const raw = response.data;
        // const frames = raw.series; // NOTE: The Python updated response uses 'series', not 'points'

        console.log(`2. AI Analysis Complete. Captured ${raw} frames.`);

        console.log(JSON.stringify(raw, null, 2)); // Log first 3 frames

        // // 3. RECONSTRUCT
        // const reconstructor = new RaceReconstructor();
        // const finalJson = reconstructor.reconstruct(frames, MOCK_STARTERS, 3200);

        // // 4. OUTPUT
        // console.log("3. Generated Final GPS JSON:");
        // console.log(JSON.stringify(finalJson, null, 2));

    } catch (error: any) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

main();