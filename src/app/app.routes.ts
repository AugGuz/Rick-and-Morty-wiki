import { Routes } from '@angular/router';
import { LocationList } from './components/location-list/location-list';
import { EpisodeList } from './components/episode-list/episode-list';
import { CharacterList } from './components/character-list/character-list';

export const routes: Routes = [
  { path: '', redirectTo: '/characters', pathMatch: 'full' },
  { path: 'characters', component: CharacterList },
  { path: 'locations', component: LocationList },
  { path: 'episodes', component: EpisodeList },
  { path: '**', redirectTo: '/characters' }
];
