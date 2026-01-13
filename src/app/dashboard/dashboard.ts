import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MovieService, YearWithMultipleWinners, Studio, ProducerInterval, MovieWinner } from '../services/movie.service';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  multipleWinnersYears = signal<YearWithMultipleWinners[]>([]);
  topStudios = signal<Studio[]>([]);
  maxIntervalProducers = signal<ProducerInterval[]>([]);
  minIntervalProducers = signal<ProducerInterval[]>([]);
  searchResults = signal<MovieWinner[]>([]);
  searchPerformed = signal(false);
  searchYear: number | null = null;

  constructor(private movieService: MovieService) { }

  public ngOnInit(): void {
    this.loadMultipleWinnersYears();
    this.loadTopStudios();
    this.loadProducersIntervals();
  }

  public searchMoviesByYear(): void {
    if (!this.searchYear) {
      this.searchResults.set([]);
      this.searchPerformed.set(false);
      return;
    }

    this.movieService.getMovieWinnersByYear(this.searchYear).subscribe({
      next: (movies) => {
        this.searchResults.set(movies || []);
        this.searchPerformed.set(true);
      },
      error: (error) => {
        console.error('Error searching movies by year:', error);
        this.searchResults.set([]);
        this.searchPerformed.set(true);
      }
    });
  }

  private loadMultipleWinnersYears(): void {
    this.movieService.getYearsWithMultipleWinners().subscribe({
      next: (response) => {
        this.multipleWinnersYears.set(response.years || []);
      },
      error: (error) => {
        console.error('Error loading years with multiple winners:', error);
        this.multipleWinnersYears.set([]);
      }
    });
  }

  private loadTopStudios(): void {
    this.movieService.getStudiosWithWinCount().subscribe({
      next: (response) => {
        const studios = response.studios || [];
        // Pegar apenas os 3 primeiros
        this.topStudios.set(studios.slice(0, 3));
      },
      error: (error) => {
        console.error('Error loading top studios:', error);
        this.topStudios.set([]);
      }
    });
  }

  private loadProducersIntervals(): void {
    this.movieService.getProducersIntervals().subscribe({
      next: (response) => {
        this.maxIntervalProducers.set(response.max || []);
        this.minIntervalProducers.set(response.min || []);
      },
      error: (error) => {
        console.error('Error loading producers intervals:', error);
        this.maxIntervalProducers.set([]);
        this.minIntervalProducers.set([]);
      }
    });
  }
}
