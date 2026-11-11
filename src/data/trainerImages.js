import ash from '../assets/images/Treinadores/Ash.jpg';
import brock from '../assets/images/Treinadores/Brock.jpg';
import misty from '../assets/images/Treinadores/Misty.jpg';
import surge from '../assets/images/Treinadores/Lt Surge.jpg';
import erika from '../assets/images/Treinadores/Erika.jpg';
import koga from '../assets/images/Treinadores/Koga.jpg';
import sabrina from '../assets/images/Treinadores/Sabrina.jpg';
import blaine from '../assets/images/Treinadores/Blaine.jpg';
import giovanni from '../assets/images/Treinadores/Giovanni.jpg';
import gary from '../assets/images/Treinadores/Gary.jpg';
import rocket from '../assets/images/Treinadores/Team Rocket.jpg';
import lance from '../assets/images/Treinadores/Lance.jpg';

const suppliedPortraits = {
  1: ash,
  2: brock,
  3: misty,
  4: surge,
  5: erika,
  6: koga,
  7: sabrina,
  8: blaine,
  9: giovanni,
  10: gary,
  11: rocket,
  12: lance,
};

// Retratos opcionais por ID têm prioridade sobre as imagens fornecidas por nome.
const files = import.meta.glob(
  '../assets/images/trainers/*.{png,jpg,jpeg,webp,svg}',
  { eager: true, query: '?url', import: 'default' },
);
export const trainerImages = {
  ...suppliedPortraits,
  ...Object.fromEntries(
    Object.entries(files).map(([path, url]) => [
      Number(path.split('/').pop().split('.')[0]),
      url,
    ]),
  ),
};
export const trainerFallback = '/images/trainer-fallback.svg';
