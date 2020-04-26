const fs = require('fs');
const bitcoin = require('bitcoinjs-lib')
const bip39 = require('bip39');
const bip32 = require('bip32');
const cliProgress = require('cli-progress');

// first seed's address
const address = '1DwGcaeWwQqxitC2ZSsFFrqRbszaMMs94b';
const getAddress = (node, network) => {
  return bitcoin.payments.p2pkh({ pubkey: node.publicKey, network }).address
};

const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
const wl = fs.readFileSync('spanish.txt').toString().split("\n");
wl.pop();

// seed to crack, there an 'x' in the place of the words we want to know
const seedAr = [
  'tumba',//    1  tumba
  'leve',//   2 leve
  'cohete',//    3 cohete
  'jugador',//    4 jugador
  'vehículo',//   5
  'lacio',//   6
  'título',//     7
  'x',//    8 arar
  'x',//   9  aviso
  'chacal',//  10 chacal
  'tono',// 11 tono
  'lluvia'//   12
];
let words = [];
let testSeed = [];
let MAXROWS = 0;
let counter = 0;
for (let i = 0; i < seedAr.length; i++) {
  if (seedAr[i] === 'x') {
    MAXROWS++;
  }
}
const MAXVALUES = 2048;
bar.start(MAXVALUES**MAXROWS, 0);
let arrs = [];
let status = false;
for (let i = 0; i < MAXROWS; i++)
    arrs[i] = 0;

while (!status) {
  let total = 0;
  // calculate total for exit condition
  for (let i=0; i < MAXROWS; i++)
    total += arrs[i];
  // test for exit condition
  if (total == (MAXVALUES-1)*MAXROWS)
    status = true;

  for (let i = 0; i < MAXROWS; i++) {
    words.push(wl[arrs[i]]);
  }
  seedAr.forEach(word => {
    if (word === 'x') {
      const newWord = words.shift();
      testSeed.push(newWord);
    } else {
      testSeed.push(word);
    }
  });
  words = [];
  counter++;
  const seedString = testSeed.join(' ');
  let seed = bip39.mnemonicToSeedSync(seedString);
  const node = bip32.fromSeed(seed, bitcoin.networks.bitcoin)
  const child1 = node.derivePath("m/44'/0'/0'/0/0");
  if (getAddress(child1) === address) {
    bar.stop();
    console.log('');
    console.log('Crack done!');
    console.log(seedString);
    process.exit();
  }
  bar.update(counter);
  testSeed = [];

  // increment loop variables
  let change = true;
  let r = MAXROWS-1;  // start from innermost loop
  while (change && r>=0) {
    // increment the innermost variable and check if spill overs
    if (++arrs[r] > MAXVALUES-1) {
        arrs[r] = 0;  // reintialize loop variable
        // Change the upper variable by one
        // We need to increment the immediate upper level loop by one
        change = true;
    }
    else
        change = false; // Stop as there the upper levels of the loop are unaffected

    // We can perform any inner loop calculation here arrs[r]

    r=r-1;  // move to upper level of the loop
  }
}















// for (let i = 0; i < wl.length; i++) {
//   for (let j = 0; j < wl.length; j++) {
//     seedAr.forEach(word => {
//       if (word === 'i') {
//         if (testSeed.indexOf(wl[i]) < 0) {
//           testSeed.push(wl[i]);
//         } else {
//           cont = true;
//           return;
//         }
//       } else if (word === 'j') {
//         if (testSeed.indexOf(wl[j]) < 0) {
//           testSeed.push(wl[j]);
//         } else {
//           cont = true;
//           return;
//         }
//       } else {
//         testSeed.push(word);
//       }
//     });
//     if (cont) {
//       cont = false;
//       testSeed = [];
//       continue;
//     }
//     counter++;
//     bar.update(counter);
//     let seed = bip39.mnemonicToSeedSync(testSeed.join(' '));
//     const node = bip32.fromSeed(seed, bitcoin.networks.bitcoin)
//     const child1 = node.derivePath("m/44'/0'/0'/0/0");
//     if (getAddress(child1) === address) {
//       bar.stop();
//       console.log('');
//       console.log('Crack done!');
//       console.log(testSeed.join(' '));
//       process.exit();
//     }
//     testSeed = [];
//   }
// }
