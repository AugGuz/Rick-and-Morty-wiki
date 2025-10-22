import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { LocationService, Location, locationapiResponse } from "../services/location.service";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-location-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <!-- Dark Rick and Morty themed background -->
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      
      <!-- Animated background elements -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-20 right-10 w-36 h-36 bg-purple-400 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute top-1/3 left-16 w-52 h-52 bg-green-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div class="absolute bottom-32 right-1/4 w-44 h-44 bg-blue-400 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto p-5">
        <!-- Rick and Morty styled header -->
        <div class="text-center mb-12">
          <h1 class="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-green-400 to-blue-400 mb-4 drop-shadow-2xl tracking-wider">
            LOCATIONS
          </h1>
          <p class="text-xl text-gray-300 font-semibold tracking-wide">
            INTERDIMENSIONAL PLACES
          </p>
          <div class="w-24 h-1 bg-gradient-to-r from-purple-400 to-green-400 mx-auto mt-4 rounded-full"></div>
        </div>
        
        <!-- Loading State -->
        <div *ngIf="loading()" class="flex flex-col items-center justify-center py-20">
          <div class="relative">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-purple-400 mb-6 shadow-lg"></div>
            <div class="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400 opacity-20"></div>
          </div>
          <p class="text-purple-400 text-xl font-semibold animate-pulse">Scanning dimensions for locations...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="text-center py-20">
          <div class="bg-red-900/20 border border-red-500/30 rounded-xl p-8 max-w-md mx-auto backdrop-blur-sm">
            <div class="text-6xl mb-4">🚨</div>
            <p class="text-red-400 text-lg mb-6 font-semibold">{{ error() }}</p>
            <button 
              (click)="loadLocations()" 
              class="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              🔄 Portal Reset
            </button>
          </div>
        </div>

        <!-- Locations Grid -->
        <div *ngIf="!loading() && hasLocations()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div *ngFor="let location of locations(); trackBy: trackLocation" 
               class="group relative bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-black/80 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 p-6">
            
            <!-- Card glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-green-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div class="relative z-10">
              <h3 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400 mb-4 group-hover:from-green-400 group-hover:to-blue-400 transition-all duration-300">
                {{ location.name }}
              </h3>
              
              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <span class="text-purple-400 font-semibold">🌍 Type:</span>
                  <span class="text-gray-300 font-medium">{{ location.type }}</span>
                </div>
                
                <div class="flex items-center space-x-2">
                  <span class="text-green-400 font-semibold">🌌 Dimension:</span>
                  <span class="text-gray-300 font-medium">{{ location.dimension }}</span>
                </div>
                
                <div class="flex items-center space-x-2">
                  <span class="text-blue-400 font-semibold">👥 Residents:</span>
                  <span class="text-gray-300 font-medium">{{ location.residents.length }}</span>
                </div>
              </div>

              <!-- Decorative bottom line -->
              <div class="mt-4 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div *ngIf="!loading() && hasNextPage() && hasLocations()" class="text-center py-12">
          <button 
            (click)="loadMoreLocations()" 
            class="group relative bg-gradient-to-r from-purple-500 to-green-500 hover:from-purple-400 hover:to-green-400 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-400/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            [disabled]="loadingMore()">
            
            <!-- Button glow effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-green-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            
            <span class="relative z-10 text-lg tracking-wide">
              {{ loadingMore() ? '🌀 Exploring Dimensions...' : '🚀 Load More Locations' }}
            </span>
          </button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && !hasLocations() && !error()" class="text-center py-20">
          <div class="text-8xl mb-6">🌌</div>
          <p class="text-gray-400 text-xl">No locations found in this reality...</p>
        </div>
      </div>
    </div>
  `,
})
export class LocationListComponent implements OnInit {
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