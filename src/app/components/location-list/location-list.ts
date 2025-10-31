import { Component, computed, inject, signal } from '@angular/core';
import { LocationService, locationapiResponse, Location } from '../../services/location.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-location-list',
  imports: [CommonModule],
  templateUrl: './location-list.html',
  styleUrl: './location-list.css'
})
export class LocationList {
    private locationService = inject(LocationService);

    // Signals for reactive state management
    locations = signal<Location[]>([]);
    loading = signal(false);
    loadingMore = signal(false);
    error = signal<string | null>(null);
    currentPage = signal(1);
    hasNextPageSignal = signal(true);

    // Computed properties for template
    hasLocations = computed(() => this.locations().length > 0);
    hasNextPage = computed(() => this.hasNextPageSignal());

    ngOnInit(): void {
        this.loadLocations();
    }

    loadLocations(): void {
        this.loading.set(true);
        this.error.set(null);
        this.currentPage.set(1);

        this.locationService.getLocations(1).subscribe({
            next: (response: locationapiResponse) => {
                this.locations.set(response.results);
                this.hasNextPageSignal.set(!!response.info.next);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Failed to load locations. Please check your internet connection and try again.');
                this.loading.set(false);
                console.error('Error loading locations:', err);
            }
        });
    }

    loadMoreLocations(): void {
        if (!this.hasNextPageSignal() || this.loadingMore()) return;

        this.loadingMore.set(true);
        const nextPage = this.currentPage() + 1;

        this.locationService.getLocations(nextPage).subscribe({
            next: (response: locationapiResponse) => {
                this.locations.set([...this.locations(), ...response.results]);
                this.hasNextPageSignal.set(!!response.info.next);
                this.currentPage.set(nextPage);
                this.loadingMore.set(false);
            },
            error: (err) => {
                this.error.set('Failed to load more locations. Please try again.');
                this.loadingMore.set(false);
                console.error('Error loading more locations:', err);
            }
        });
    }

    trackLocation(index: number, location: Location): number {
        return location.id;
    }
}
