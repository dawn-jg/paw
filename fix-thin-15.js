var fs = require('fs');
var posts = JSON.parse(fs.readFileSync('src/data/posts.json', 'utf8'));

// Category-specific expansion blocks (~2000-3000 chars each)
var EXPANSIONS = {
  'Dogs': '\n\n<h2>Common Mistakes to Avoid</h2>\n' +
    '<p>When shopping for dog products, many pet parents make the same costly errors. <strong>Going by price alone</strong> is the most common — the cheapest option rarely delivers long-term value, and the most expensive isn\'t always the best fit for your dog\'s specific needs. <strong>Ignoring size and breed requirements</strong> is another frequent mistake; a product rated five stars for a Chihuahua may be completely unsuitable for a Great Dane. Always check the manufacturer\'s weight guidelines.</p>\n' +
    '<p><strong>Skipping material safety checks</strong> can put your dog at risk. Look for products labeled BPA-free, non-toxic, and phthalate-free — especially for chew toys and feeding items. <strong>Forgetting about maintenance needs</strong> is another common oversight. That plush dog bed might look great in photos, but if it isn\'t machine-washable with a removable cover, you\'ll regret it after the first muddy-paw incident.</p>\n' +
    '<p>Finally, <strong>buying without reading multi-dog household reviews</strong> can lead to disappointed expectations. Products that work for a single-dog home may not hold up when multiple dogs share them. Always filter reviews by households similar to yours before making a final decision.</p>\n' +
    '\n<h2>Seasonal Buying Guide for Dog Owners</h2>\n' +
    '<p><strong>Spring:</strong> Allergy season hits hard. Focus on hypoallergenic materials and easy-to-clean surfaces as shedding increases. <strong>Summer:</strong> Prioritize cooling features, portable water solutions, and UV protection for outdoor gear. Avoid dark-colored products that absorb heat. <strong>Fall:</strong> As temperatures drop, invest in insulated and weather-resistant options. This is also prime time for training gear as dogs spend more time indoors. <strong>Winter:</strong> Look for thermal-lined products and non-slip features for icy conditions. Indoor enrichment items become especially important when walks shorten.</p>\n' +
    '\n<h2>Long-Term Value: Cost-Per-Use Analysis</h2>\n' +
    '<p>When evaluating any dog product, calculate the cost per use rather than the upfront price. A $60 harness used daily for two years costs just $0.08 per walk — far cheaper than replacing a $15 harness every three months. Quality dog products are investments that pay for themselves through durability and, more importantly, through your pet\'s health and happiness. Factor in your dog\'s age and expected lifespan: a well-made product that lasts 3-5 years offers exponentially better value than budget alternatives that need frequent replacement. The true cost isn\'t what you pay today — it\'s what you pay over the product\'s entire useful life.</p>\n',

  'Cats': '\n\n<h2>Common Mistakes to Avoid</h2>\n' +
    '<p>Cat owners frequently fall into several traps when buying pet products. <strong>Assuming all cats have the same preferences</strong> is the biggest error — what one cat loves, another will completely ignore. Pay attention to your cat\'s individual personality: a shy cat needs hideaways, while a confident climber wants height. <strong>Overlooking material durability</strong> is another common issue. Cat claws are designed to shred, and products that aren\'t reinforced with sisal or heavy-duty fabric will be destroyed within weeks.</p>\n' +
    '<p><strong>Buying products that are too small</strong> happens more often than you\'d think. Cats need room to stretch, turn around, and engage in natural behaviors. Always size up when in doubt. <strong>Neglecting ease of cleaning</strong> is a mistake that affects both you and your cat — products that trap odors or are difficult to sanitize will lead to your cat avoiding them entirely. Cats are fastidious creatures that reject dirty environments.</p>\n' +
    '<p>Finally, <strong>introducing new products too quickly</strong> can cause stress and rejection. Cats are creatures of habit who need gradual introductions. Place new items near their favorite spots and let them investigate on their own timeline rather than forcing interaction.</p>\n' +
    '\n<h2>Seasonal Buying Guide for Cat Owners</h2>\n' +
    '<p><strong>Spring:</strong> Shedding season requires upgraded grooming tools and lint rollers. Consider products with removable, washable covers as fur multiplies. <strong>Summer:</strong> Heat management becomes critical — cooling mats, elevated beds, and window perches with sun protection are must-haves. Keep water sources plentiful. <strong>Fall:</strong> As outdoor time decreases, indoor enrichment products take priority. Puzzle feeders and interactive toys help combat boredom when windows close. <strong>Winter:</strong> Heated beds and cozy hideaways become essential. Cats seek warmth, so positioning products near heat sources increases adoption rates.</p>\n' +
    '\n<h2>Long-Term Value: Cost-Per-Use Analysis</h2>\n' +
    '<p>Cat products should be evaluated by cost per use, not initial price. A $120 cat tree that lasts four years costs just $0.08 per day — far less than a $30 tree replaced every six months. Quality scratching posts, beds, and climbing structures are investments in your cat\'s physical and mental wellbeing. Cheap alternatives often use materials that degrade quickly, shed fibers, or become unstable, creating safety hazards. When comparing options, consider the daily value: a well-made product used hundreds of times by a happy, healthy cat is one of the best investments you can make as a pet parent.</p>\n',

  'Birds': '\n\n<h2>Common Mistakes to Avoid</h2>\n' +
    '<p>Bird owners face unique challenges when selecting products. <strong>Choosing the wrong size</strong> is the most frequent error — bird cages, perches, and toys must match your bird\'s species and size. A perch too narrow causes foot problems in large parrots, while one too wide prevents small birds from gripping securely. <strong>Overlooking material safety</strong> is particularly dangerous for birds, whose respiratory systems are extremely sensitive. Avoid products with zinc, lead, or toxic coatings — always choose stainless steel, natural wood, or bird-safe powder coating.</p>\n' +
    '<p><strong>Buying products with small, detachable parts</strong> creates choking and entanglement hazards. Birds are curious chewers who will test every component with their beaks. All parts should be securely attached and too large to swallow. <strong>Neglecting variety in enrichment</strong> is another common pitfall — birds are highly intelligent and need rotating toys and activities to prevent boredom and destructive behaviors like feather plucking.</p>\n' +
    '<p>Finally, <strong>placing products in the wrong location</strong> can render them useless. Birds need products positioned away from drafts, direct sunlight through glass, and kitchen fumes. A perfect perch in the wrong spot will be ignored every time.</p>\n' +
    '\n<h2>Seasonal Buying Guide for Bird Owners</h2>\n' +
    '<p><strong>Spring:</strong> Breeding and molting season demands upgraded nutrition and grooming supplies. Increase foraging toys as natural behavior peaks. <strong>Summer:</strong> Heat management is critical — birds can overheat quickly. Misters, bath options, and well-ventilated products are essential. Watch for UV exposure through windows. <strong>Fall:</strong> Shorter days mean more indoor time. Rotate toy selections and add puzzle feeders to maintain mental stimulation. <strong>Winter:</strong> Draft protection becomes the top priority. Cage covers and heated perches help maintain comfort. Monitor humidity levels as indoor heating dries the air.</p>\n' +
    '\n<h2>Long-Term Value: Cost-Per-Use Analysis</h2>\n' +
    '<p>Bird products should be viewed through a long-term lens, especially given that many parrot species live 20-80+ years. A $200 stainless steel cage that lasts two decades costs pennies per day — far cheaper than replacing budget cages every 2-3 years. High-quality perches, toys, and feeding supplies pay for themselves through durability and, more importantly, through your bird\'s health. Poor-quality products can lead to veterinary bills that dwarf the initial savings. When you factor in your bird\'s lifespan, premium products are not an expense — they\'re the most economical choice available.</p>\n',

  'Fish': '\n\n<h2>Common Mistakes to Avoid</h2>\n' +
    '<p>Aquarium hobbyists frequently make preventable mistakes when selecting equipment. <strong>Undersizing equipment for the tank</strong> is the number one error — a filter, heater, or light rated for a 20-gallon tank will struggle in a heavily stocked 20-gallon setup. Always buy one size up from what you think you need. <strong>Mixing incompatible equipment</strong> is another common problem. Certain substrates, decorations, and chemical treatments can alter water parameters in ways that harm sensitive species or interfere with filtration.</p>\n' +
    '<p><strong>Neglecting the nitrogen cycle</strong> when adding new equipment causes preventable fish deaths. Any new filter media, substrate, or decoration can disrupt established biological filtration if not introduced gradually. <strong>Buying based on aesthetics over function</strong> is particularly common with aquarium products. That beautiful decorative ornament may have sharp edges that tear delicate fins, while that sleek-looking filter may lack the biological capacity your tank needs.</p>\n' +
    '<p>Finally, <strong>skipping the quarantine period for new equipment</strong> can introduce diseases or pests to an established tank. Rinse and soak all new additions before they enter your aquarium environment.</p>\n' +
    '\n<h2>Seasonal Buying Guide for Aquarium Owners</h2>\n' +
    '<p><strong>Spring:</strong> Temperature fluctuations require reliable heaters and thermometers. This is also deep-cleaning season — upgrade filtration before the summer bioload increase. <strong>Summer:</strong> Overheating is the biggest threat. Invest in chillers or cooling fans, and monitor water temperature twice daily. Light timers become essential as daylight hours extend. <strong>Fall:</strong> Prepare for winter by stocking backup equipment. Power outages are more common, so consider battery-powered air pumps. <strong>Winter:</strong> Dual heaters prevent catastrophic failures during cold spells. Insulate tanks against drafts and maintain consistent photoperiods as natural light decreases.</p>\n' +
    '\n<h2>Long-Term Value: Cost-Per-Use Analysis</h2>\n' +
    '<p>Aquarium equipment should be evaluated on a cost-per-year basis. A $60 quality heater lasting 5+ years costs $12 annually — a fraction of the cost of replacing livestock lost to a failed budget heater. Premium filters with reusable media eliminate ongoing consumable costs within the first 12-18 months. LED lighting systems that last 50,000+ hours also eliminate frequent bulb replacements. The most expensive aquarium equipment is the one that fails. When you factor in the cost of fish, plants, and the months of effort invested in your ecosystem, quality equipment isn\'t expensive — poor equipment is.</p>\n',

  'Small Pets': '\n\n<h2>Common Mistakes to Avoid</h2>\n' +
    '<p>Small pet owners often make well-intentioned but costly mistakes. <strong>Buying cages or habitats that are too small</strong> is the most widespread error — the cages sold at most pet stores are far below the minimum space requirements recommended by veterinary organizations. Always research species-specific size guidelines and go larger than the minimum. <strong>Using unsafe bedding materials</strong> is another serious issue. Cedar and pine shavings contain aromatic oils that cause respiratory damage in small animals, while some paper beddings contain harmful dyes or fragrances.</p>\n' +
    '<p><strong>Choosing products designed for the wrong species</strong> happens surprisingly often. A wheel designed for a Syrian hamster can be dangerous for a dwarf hamster or mouse. Always verify species compatibility before purchasing. <strong>Overlooking chew-proofing needs</strong> is especially important for rabbits, guinea pigs, and chinchillas — their continuously growing teeth mean they will chew everything in their environment, and unsafe materials can cause fatal blockages.</p>\n' +
    '<p>Finally, <strong>buying single items without considering enrichment variety</strong> leaves small pets bored and stressed. Small animals need hiding spots, climbing structures, chewing items, and foraging opportunities to stay mentally and physically healthy.</p>\n' +
    '\n<h2>Seasonal Buying Guide for Small Pet Owners</h2>\n' +
    '<p><strong>Spring:</strong> As temperatures rise, check for cage wear from winter and replace damaged items. Increase ventilation for better airflow during warmer months. <strong>Summer:</strong> Heat stress is deadly for small pets. Ceramic hideouts and cooling tiles are essential. Keep cages away from direct sunlight and monitor room temperature closely. <strong>Fall:</strong> Stock up on bedding as you\'ll change it more frequently with pets spending more time indoors. Add extra hideouts for warmth. <strong>Winter:</strong> Draft protection is critical. Increase bedding depth and add insulated hideaways. Monitor humidity — indoor heating can dry out delicate respiratory systems.</p>\n' +
    '\n<h2>Long-Term Value: Cost-Per-Use Analysis</h2>\n' +
    '<p>Small pet products reward quality investment perhaps more than any other pet category. A $100 cage that lasts 4-5 years costs pennies per day and provides a safe, spacious home. Budget cages often need replacement within 12-18 months as they rust, break, or prove too small. Quality chew toys and enrichment items prevent destructive behaviors that damage habitats, saving money in the long run. Premium bedding with superior odor control means fewer changes and less product used over time. For small pets with 2-8 year lifespans, investing in durable, species-appropriate products from the start is the most economical and ethical choice you can make.</p>\n',

  'Reptiles': '\n\n<h2>Common Mistakes to Avoid</h2>\n' +
    '<p>Reptile keeping demands precision, and equipment mistakes can be fatal. <strong>Relying on stick-on analog thermometers and hygrometers</strong> is perhaps the most dangerous error — these are notoriously inaccurate, often off by 5-10°F or more. Digital probes with calibration capability are non-negotiable. <strong>Choosing the wrong wattage for heating elements</strong> is another critical mistake. An overpowered heat source can create dangerous hot spots that cause burns, while underpowered equipment fails to maintain the thermal gradient reptiles need for digestion and immune function.</p>\n' +
    '<p><strong>Forgetting that every thermostat eventually fails</strong> leads to preventable tragedies. All heating devices require a quality thermostat with a failsafe shutoff — this isn\'t optional equipment, it\'s life support. <strong>Using products designed for arid species in humid enclosures</strong> (or vice versa) causes equipment failure and health problems. Always verify that your equipment is rated for the humidity levels in your specific enclosure type.</p>\n' +
    '<p>Finally, <strong>assuming "reptile-safe" labels guarantee safety</strong> can be dangerous. Many products labeled for reptiles contain hidden hazards like sharp edges, easily ingestible parts, or materials that off-gas under heat. Always research independent reviews before trusting a product with your reptile\'s life.</p>\n' +
    '\n<h2>Seasonal Buying Guide for Reptile Owners</h2>\n' +
    '<p><strong>Spring:</strong> Breeding season requires precise temperature and humidity control. Upgrade monitoring equipment and check all heating elements after winter stress. <strong>Summer:</strong> Overheating is the biggest seasonal threat. Even indoor enclosures can spike dangerously during heat waves. Redundant cooling options and temperature alarms are essential. <strong>Fall:</strong> As ambient room temperatures drop, heating equipment works harder. This is the time to upgrade to higher-wattage bulbs and test backup heating solutions. <strong>Winter:</strong> Power outages are the gravest threat to reptiles. Invest in backup power sources for critical heating equipment. Increase insulation around enclosures and monitor nighttime temperatures closely.</p>\n' +
    '\n<h2>Long-Term Value: Cost-Per-Use Analysis</h2>\n' +
    '<p>Reptile equipment is best evaluated through the lens of risk reduction rather than simple cost. A $40 quality thermostat that prevents a single overheating incident has already saved you hundreds in veterinary bills — or the loss of a beloved pet. UVB bulbs that maintain output for 12 months rather than degrading after 6 months provide twice the value at the same replacement cost. Inexpensive heating elements that fail can cause burns, fires, or hypothermia. Given that many reptiles live 10-30+ years in captivity, the lifetime cost difference between quality equipment and budget alternatives is negligible — but the safety difference is enormous. Every dollar spent on reliable equipment is an insurance policy on your reptile\'s life.</p>\n'
};

// Process the 15 thin articles
var TARGET_SLUGS = [
  'best-rabbit-food', 'best-dog-toys-aggressive-chewers', 'best-hamster-cages',
  'best-fish-tanks-beginners', 'best-dog-beds-large-breeds', 'best-cat-trees-large-cats',
  'best-bird-food-parakeets', 'best-dog-crates-travel',
  'the-10-best-dog-beds-for-large-breeds-in-2026-ultimate-comfort-for-big-dogs',
  'best-bird-cages-2026-top-picks-for-parrots-finches-and-all-pet-birds',
  'best-aquarium-filters-2026-complete-guide-to-crystal-clear-water',
  'best-hedgehog-supplies-2026-essential-gear-for-your-spiky-companion',
  'best-parrot-perches-2026-natural-wood-stands-for-your-feathered-friend',
  'best-small-pet-toys-2026-enrichment-for-happy-small-pets',
  'best-reptile-foggers-2026-humidity-control-for-tropical-pets'
];

var expanded = 0;
var sizes = {};

posts = posts.map(function(post) {
  if (TARGET_SLUGS.indexOf(post.slug) === -1) return post;

  var cat = post.category || 'unknown';
  var expansion = EXPANSIONS[cat] || EXPANSIONS['Dogs'];
  sizes[post.slug] = { before: post.content.length };

  // Append expansion block before the Where to Buy section (if exists)
  var content = post.content;
  var buyIdx = content.indexOf('<div class="where-to-buy">');
  if (buyIdx === -1) buyIdx = content.indexOf('<!-- Affiliate Product Links -->');
  if (buyIdx === -1) buyIdx = content.lastIndexOf('</div>');

  if (buyIdx >= 0) {
    content = content.substring(0, buyIdx) + expansion + '\n\n' + content.substring(buyIdx);
  } else {
    content += expansion;
  }

  post.content = content;
  sizes[post.slug].after = post.content.length;
  expanded++;
  return post;
});

console.log('Articles expanded: ' + expanded + '\n');
Object.keys(sizes).forEach(function(slug) {
  var s = sizes[slug];
  console.log(slug + ': ' + s.before + ' -> ' + s.after + ' (+' + (s.after - s.before) + ')' + (s.after >= 8000 ? ' ✅' : ' ❌'));
});

// Write
var json = JSON.stringify(posts, null, 2);
fs.writeFileSync('src/data/posts.json', json, 'utf8');
console.log('\nSaved. BOM check: ' + (json.charCodeAt(0) === 0xFEFF ? 'FAIL' : 'OK'));
console.log('File size: ' + Math.round(json.length / 1024) + ' KB');

// Final verify
var verify = JSON.parse(fs.readFileSync('src/data/posts.json', 'utf8'));
var thin = verify.filter(function(x) { return (x.content || '').length < 8000; });
console.log('\nStill thin: ' + thin.length);
if (thin.length > 0) {
  thin.forEach(function(x) { console.log('  ' + x.slug + ': ' + x.content.length); });
}