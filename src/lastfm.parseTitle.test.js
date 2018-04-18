import { parseTitle } from './LastFM.js';

const testValues = [
    'Disclosure - You & Me feat. Eliza Doolittle (Flume Remix)',
    'Disclosure - Latch feat. Sam Smith ()',
    'Disclosure - F For You ',
    'Disclosure feat. London Grammar - Help Me Lose My Mind',
    'Detroit Swindle - The Break Up |Heist Recordings|',
    'Detroit Swindle Boiler Room London DJ Set ',
    'Detroit Swindle - The Wrap Around ',
    'Detroit Swindle - That Freak Stuff (Original Mix) |Tsuba| ',
    'OPETH - Sorceress (OFFICIAL LYRIC VIDEO) ',
    'Opeth - Reverie / Harlequin Forest (Audio) ',
    'Opeth - Burden [OFFICIAL VIDEO]',
    'Opeth - Cusp Of Eternity (Audio)',
    'Opeth - The Devil\'s Orchard [OFFICIAL VIDEO]',
    'Opeth - Harvest | Official Music Video',
    'Opeth - Deliverance (Live at Shepherd\'s Bush Empire, London)',
    ' Gaby Nieto - Way Down Ft Beklyn (Drunken Coconut) ',
    'Floating Points - Ratio (Full Mix)',
    'Floating Points - Reflections - Mojave Desert - Silurian Blue',
    'Floating Points - Silhouettes I, II and III',
    'Floating Points - Montparnasse',
    'Floating Points - ARP3',
    'Soichi Terada - Moments of Samples (A 3)',
    'One - Electrosoul System & Subwave [HD] (Drum&BassArena presents: Summer Selection WEB)',
    'A-Sides - So Natural (Featuring MC Fats)',
    'Drumagick - Sambarock (HD)',
    'Deniro - Don Dino [TRP016]',
    'Toka Project - Café Style',
    'Intr0beatz - Trees Breez',
    'Afro Medusa - Pasilda - Knee Deep Remix',
    'Noisia Radio S04E01',
    "Qubiko & K-909 'These Days'",
    'Dario D\'Attis & Definition featuring Jinadu ‘Dreamcatcher’',
    "Dario D'Attis & Sven Tasnadi 'I Need'",
];

const testExpectedValues = [
    { artist: 'Disclosure', title: 'You & Me feat. Eliza Doolittle (Flume Remix)' },
    { artist: 'Disclosure', title: 'Latch feat. Sam Smith' },
    { artist: 'Disclosure', title: 'F For You' },
    { artist: 'Disclosure feat. London Grammar', title: 'Help Me Lose My Mind' },
    { artist: 'Detroit Swindle', title: 'The Break Up' },
    null,
    { artist: 'Detroit Swindle', title: 'The Wrap Around' },
    { artist: 'Detroit Swindle', title: 'That Freak Stuff (Original Mix)' },
    { artist: 'OPETH', title: 'Sorceress' },
    { artist: 'Opeth', title: 'Reverie / Harlequin Forest' },
    { artist: 'Opeth', title: 'Burden' },
    { artist: 'Opeth', title: 'Cusp Of Eternity' },
    { artist: 'Opeth', title: 'The Devil\'s Orchard' },
    { artist: 'Opeth', title: 'Harvest' },
    { artist: 'Opeth', title: 'Deliverance (Live at Shepherd\'s Bush Empire, London)' },
    { artist: 'Gaby Nieto', title: 'Way Down Ft Beklyn (Drunken Coconut)'},
    { artist: 'Floating Points', title: 'Ratio (Full Mix)' },
    { artist: 'Floating Points', title: 'Reflections - Mojave Desert - Silurian Blue' },
    { artist: 'Floating Points', title: 'Silhouettes I, II and III' },
    { artist: 'Floating Points', title: 'Montparnasse' },
    { artist: 'Floating Points', title: 'ARP3' },
    { artist: 'Soichi Terada', title: 'Moments of Samples' },
    { artist: 'One', title: 'Electrosoul System & Subwave' },
    { artist: 'A-Sides', title: 'So Natural (Featuring MC Fats)' },
    { artist: 'Drumagick', title: 'Sambarock' },
    { artist: 'Deniro', title: 'Don Dino' },
    { artist: 'Toka Project', title: 'Café Style' },
    { artist: 'Intr0beatz', title: 'Trees Breez' },
    { artist: 'Afro Medusa', title: 'Pasilda - Knee Deep Remix' },
    null,
    { artist: 'Qubiko & K-909', title: 'These Days' },
    { artist: 'Dario D\'Attis & Definition featuring Jinadu', title: 'Dreamcatcher' },
    { artist: 'Dario D\'Attis & Sven Tasnadi', title: 'I Need' },
];

export const doTest = () => {
    let passedTests = 0;
    console.info('%cPassing tests for: %cparseTitle', 'color: rgb(180, 170, 10)',
                 'font-family: monospace; color: rgb(180, 170, 10)');
    for(let i = 0; i < testValues.length; i++) {
        const value = testValues[i];
        const expected = testExpectedValues[i];
        const current = parseTitle(value);
        let ok = true;
        if(current !== expected) {
            if(current === null && expected !== null) {
                ok = false;
                console.warn(` - ${value}: %c✗`, 'color: rgb(230, 20, 40)');
                console.warn(`    Current value null`);
                console.warn(`    Expected value "${JSON.stringify(expected)}"`);
            } else {
                if(current.title !== expected.title) {
                    if(ok) console.warn(` - ${value}: %c✗`, 'color: rgb(230, 20, 40)');
                    ok = false;
                    console.warn(`    Current title "${current.title}"`);
                    console.warn(`    Expected title "${expected.title}"`);
                }
                if(current.artist !== expected.artist) {
                    if(ok) console.warn(` - ${value}: %c✗`, 'color: rgb(230, 20, 40)');
                    ok = false;
                    console.warn(`    Current artist "${current.artist}"`);
                    console.warn(`    Expected artist "${expected.artist}"`);
                }
            }
        }
        if(ok) {
            passedTests++;
        }
    }
    console.info(`%cPassed ${passedTests} of ${testValues.length}`, 'color: rgb(180, 170, 10)');
}
