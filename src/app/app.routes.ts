import { Routes } from '@angular/router';
import { CharacterListComponent } from './components/character-list.component';
import { LocationListComponent } from './components/location-list.component';
import { EpisodeListComponent } from './components/episode-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/characters', pathMatch: 'full' },
  { path: 'characters', component: CharacterListComponent },
  { path: 'locations', component: LocationListComponent },
  { path: 'episodes', component: EpisodeListComponent },
  { path: '**', redirectTo: '/characters' }
];
