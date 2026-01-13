import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Movies } from './movies';
import { MovieService, Movie, MoviesPageResponse } from '../services/movie.service';

describe(Movies.name, () => {
  let fixture: any;
  let component: Movies;
  let movieServiceMock: {
    getMovies: ReturnType<typeof vi.fn>;
  };

  const sampleMovies: Movie[] = [
    { id: 1, year: 1980, title: 'Movie A', studios: ['Studio A'], producers: ['Producer A'], winner: true },
    { id: 2, year: 1981, title: 'Movie B', studios: ['Studio B'], producers: ['Producer B'], winner: false },
    { id: 3, year: 1982, title: 'Movie C', studios: ['Studio C'], producers: ['Producer C'], winner: true },
  ];

  const sampleResponse: MoviesPageResponse = {
    content: sampleMovies,
    pageable: { pageNumber: 0, pageSize: 15 },
    totalPages: 3,
    totalElements: 45,
    first: true,
    last: false,
    number: 0,
    size: 15,
  };

  beforeEach(async () => {
    movieServiceMock = {
      getMovies: vi.fn(() => of(sampleResponse)),
    };

    await TestBed.configureTestingModule({
      imports: [Movies],
      providers: [{ provide: MovieService, useValue: movieServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Movies);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load movies on init', () => {
    fixture.detectChanges();

    expect(movieServiceMock.getMovies).toHaveBeenCalledWith(0, 15, undefined, undefined);
    expect(component.movies()).toEqual(sampleMovies);
    expect(component.totalPages()).toBe(3);
    expect(component.totalElements()).toBe(45);
    expect(component.loading()).toBe(false);
  });

  describe('Filters', () => {
    beforeEach(() => {
      fixture.detectChanges();
      movieServiceMock.getMovies.mockClear();
    });

    it('should apply year filter and reset to page 0', () => {
      component.filterYear = 1985;
      component.applyFilters();

      expect(component.currentPage()).toBe(0);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(0, 15, 1985, undefined);
    });

    it('should apply winner filter and reset to page 0', () => {
      component.filterWinner = true;
      component.applyFilters();

      expect(component.currentPage()).toBe(0);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(0, 15, undefined, true);
    });

    it('should apply both filters together', () => {
      component.filterYear = 1990;
      component.filterWinner = false;
      component.applyFilters();

      expect(component.currentPage()).toBe(0);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(0, 15, 1990, false);
    });

    it('should clear filters when set to null', () => {
      component.filterYear = null;
      component.filterWinner = null;
      component.applyFilters();

      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(0, 15, undefined, undefined);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
      movieServiceMock.getMovies.mockClear();
    });

    it('should navigate to next page', () => {
      component.nextPage();

      expect(component.currentPage()).toBe(1);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(1, 15, undefined, undefined);
    });

    it('should not navigate past last page', () => {
      component.currentPage.set(2);
      component.nextPage();

      expect(component.currentPage()).toBe(2);
      expect(movieServiceMock.getMovies).not.toHaveBeenCalled();
    });

    it('should navigate to previous page', () => {
      component.currentPage.set(2);
      component.previousPage();

      expect(component.currentPage()).toBe(1);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(1, 15, undefined, undefined);
    });

    it('should not navigate before first page', () => {
      component.currentPage.set(0);
      component.previousPage();

      expect(component.currentPage()).toBe(0);
      expect(movieServiceMock.getMovies).not.toHaveBeenCalled();
    });

    it('should go to first page', () => {
      component.currentPage.set(2);
      component.goToFirstPage();

      expect(component.currentPage()).toBe(0);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(0, 15, undefined, undefined);
    });

    it('should go to last page', () => {
      component.goToLastPage();

      expect(component.currentPage()).toBe(2);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(2, 15, undefined, undefined);
    });

    it('should go to specific page', () => {
      component.goToPage(1);

      expect(component.currentPage()).toBe(1);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(1, 15, undefined, undefined);
    });
  });

  describe('visiblePages computed signal', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show all pages when total is 5 or less', () => {
      component.totalPages.set(3);

      expect(component.visiblePages()).toEqual([0, 1, 2]);
    });

    it('should show 5 pages centered around current page', () => {
      component.totalPages.set(10);
      component.currentPage.set(5);

      expect(component.visiblePages()).toEqual([3, 4, 5, 6, 7]);
    });

    it('should show first 5 pages when at beginning', () => {
      component.totalPages.set(10);
      component.currentPage.set(0);

      expect(component.visiblePages()).toEqual([0, 1, 2, 3, 4]);
    });

    it('should show last 5 pages when at end', () => {
      component.totalPages.set(10);
      component.currentPage.set(9);

      expect(component.visiblePages()).toEqual([5, 6, 7, 8, 9]);
    });

    it('should handle single page correctly', () => {
      component.totalPages.set(1);
      component.currentPage.set(0);

      expect(component.visiblePages()).toEqual([0]);
    });
  });

  describe('Loading state', () => {
    it('should set loading to true during request', () => {
      movieServiceMock.getMovies.mockImplementationOnce(() => {
        expect(component.loading()).toBe(true);
        return of(sampleResponse);
      });

      fixture.detectChanges();
    });

    it('should set loading to false after successful response', () => {
      fixture.detectChanges();

      expect(component.loading()).toBe(false);
    });

  });
});
