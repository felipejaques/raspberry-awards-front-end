import { Component, signal, OnInit, computed, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MovieService, Movie } from '../services/movie.service';

@Component({
  selector: 'app-movies',
  imports: [FormsModule],
  templateUrl: './movies.html',
  styleUrl: './movies.scss'
})
export class Movies implements OnInit {
  movies = signal<Movie[]>([]);
  loading = signal(false);
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = 15;

  filterYear: number | null = null;
  filterWinner: boolean | null = null;

  private filterSubject = new Subject<{ year: number | null; winner: boolean | null }>();

  constructor(private movieService: MovieService) { }

  public ngOnInit(): void {
    this.filterSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged((prev, curr) =>
          prev.year === curr.year && prev.winner === curr.winner
        )
      )
      .subscribe((filters) => {
        if (filters.year !== null && filters.year.toString().length < 4) {
          return;
        }

        this.currentPage.set(0);
        this.loadMovies();
      });

    this.loadMovies();
  }


  public applyFilters(): void {
    this.filterSubject.next({ year: this.filterYear, winner: this.filterWinner });
  }

  public goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadMovies();
  }

  public nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.loadMovies();
    }
  }

  public previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadMovies();
    }
  }

  public goToFirstPage(): void {
    this.currentPage.set(0);
    this.loadMovies();
  }

  public goToLastPage(): void {
    this.currentPage.set(this.totalPages() - 1);
    this.loadMovies();
  }

  private loadMovies(): void {
    this.loading.set(true);

    this.movieService.getMovies(
      this.currentPage(),
      this.pageSize,
      this.filterYear ?? undefined,
      this.filterWinner ?? undefined
    ).subscribe({
      next: (response) => {
        this.movies.set(response.content || []);
        this.totalPages.set(response.totalPages || 0);
        this.totalElements.set(response.totalElements || 0);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading movies:', error);
        this.movies.set([]);
        this.loading.set(false);
      }
    });
  }

  // Computed para mostrar apenas algumas páginas na paginação
  public visiblePages: Signal<number[]> = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i);
    }

    let start = Math.max(0, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    return Array.from({ length: end - start }, (_, i) => start + i);
  });
}
