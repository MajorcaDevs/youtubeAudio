import { parseTitle } from '../LastFM.js';

const testData = [
    [
        'Disclosure - You & Me feat. Eliza Doolittle (Flume Remix)',
        { artist: 'Disclosure', title: 'You & Me feat. Eliza Doolittle (Flume Remix)' },
    ],
    [
        'Disclosure - Latch feat. Sam Smith ()',
        { artist: 'Disclosure', title: 'Latch feat. Sam Smith' },
    ],
    [
        'Disclosure - F For You ',
        { artist: 'Disclosure', title: 'F For You' },
    ],
    [
        'Disclosure feat. London Grammar - Help Me Lose My Mind',
        { artist: 'Disclosure feat. London Grammar', title: 'Help Me Lose My Mind' },
    ],
    [
        'Detroit Swindle - The Break Up |Heist Recordings|',
        { artist: 'Detroit Swindle', title: 'The Break Up' },
    ],
    [
        'Detroit Swindle Boiler Room London DJ Set ',
        null,
    ],
    [
        'Detroit Swindle - The Wrap Around ',
        { artist: 'Detroit Swindle', title: 'The Wrap Around' },
    ],
    [
        'Detroit Swindle - That Freak Stuff (Original Mix) |Tsuba| ',
        { artist: 'Detroit Swindle', title: 'That Freak Stuff (Original Mix)' },
    ],
    [
        'OPETH - Sorceress (OFFICIAL LYRIC VIDEO) ',
        { artist: 'OPETH', title: 'Sorceress' },
    ],
    [
        'Opeth - Reverie / Harlequin Forest (Audio) ',
        { artist: 'Opeth', title: 'Reverie / Harlequin Forest' },
    ],
    [
        'Opeth - Burden [OFFICIAL VIDEO]',
        { artist: 'Opeth', title: 'Burden' },
    ],
    [
        'Opeth - Cusp Of Eternity (Audio)',
        { artist: 'Opeth', title: 'Cusp Of Eternity' },
    ],
    [
        'Opeth - The Devil\'s Orchard [OFFICIAL VIDEO]',
        { artist: 'Opeth', title: 'The Devil\'s Orchard' },
    ],
    [
        'Opeth - Harvest | Official Music Video',
        { artist: 'Opeth', title: 'Harvest' },
    ],
    [
        'Opeth - Deliverance (Live at Shepherd\'s Bush Empire, London)',
        { artist: 'Opeth', title: 'Deliverance (Live at Shepherd\'s Bush Empire, London)' },
    ],
    [
        ' Gaby Nieto - Way Down Ft Beklyn (Drunken Coconut) ',
        { artist: 'Gaby Nieto', title: 'Way Down Ft Beklyn (Drunken Coconut)'},
    ],
    [
        'Floating Points - Ratio (Full Mix)',
        { artist: 'Floating Points', title: 'Ratio (Full Mix)' },
    ],
    [
        'Floating Points - Reflections - Mojave Desert - Silurian Blue',
        { artist: 'Floating Points', title: 'Reflections - Mojave Desert - Silurian Blue' },
    ],
    [
        'Floating Points - Silhouettes I, II and III',
        { artist: 'Floating Points', title: 'Silhouettes I, II and III' },
    ],
    [
        'Floating Points - Montparnasse',
        { artist: 'Floating Points', title: 'Montparnasse' },
    ],
    [
        'Floating Points - ARP3',
        { artist: 'Floating Points', title: 'ARP3' },
    ],
    [
        'Soichi Terada - Moments of Samples (A 3)',
        { artist: 'Soichi Terada', title: 'Moments of Samples' },
    ],
    [
        'One - Electrosoul System & Subwave [HD] (Drum&BassArena presents: Summer Selection WEB)',
        { artist: 'One', title: 'Electrosoul System & Subwave' },
    ],
    [
        'A-Sides - So Natural (Featuring MC Fats)',
        { artist: 'A-Sides', title: 'So Natural (Featuring MC Fats)' },
    ],
    [
        'Drumagick - Sambarock (HD)',
        { artist: 'Drumagick', title: 'Sambarock' },
    ],
    [
        'Deniro - Don Dino [TRP016]',
        { artist: 'Deniro', title: 'Don Dino' },
    ],
    [
        'Toka Project - Café Style',
        { artist: 'Toka Project', title: 'Café Style' },
    ],
    [
        'Intr0beatz - Trees Breez',
        { artist: 'Intr0beatz', title: 'Trees Breez' },
    ],
    [
        'Afro Medusa - Pasilda - Knee Deep Remix',
        { artist: 'Afro Medusa', title: 'Pasilda - Knee Deep Remix' },
    ],
    [
        'Noisia Radio S04E01',
        null,
    ],
    [
        'Qubiko & K-909 \'These Days\'',
        { artist: 'Qubiko & K-909', title: 'These Days' },
    ],
    [
        'Dario D\'Attis & Definition featuring Jinadu ‘Dreamcatcher’',
        { artist: 'Dario D\'Attis & Definition featuring Jinadu', title: 'Dreamcatcher' },
    ],
    [
        'Dario D\'Attis & Sven Tasnadi \'I Need\'',
        { artist: 'Dario D\'Attis & Sven Tasnadi', title: 'I Need' },
    ],
];

describe('LastFM.parseTitle', () => {
    testData.forEach(([testValue, expectedValue], i) => {
        it(`test value ${i}: ${testValue}`, () => {
            const result = parseTitle(testValue);

            if(expectedValue !== null) {
                expect(result).not.toBeNull();
                expect(result.artist).toBe(expectedValue.artist);
                expect(result.title).toBe(expectedValue.title);
            } else {
                expect(result).toBeNull();
            }
        });
    });
});
