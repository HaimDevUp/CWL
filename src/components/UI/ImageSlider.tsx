'use client';

import { useState, useEffect, useCallback } from 'react';
import './ImageSlider.scss';

interface ImageSliderProps {
    images: string[];
    autoPlay?: boolean;
    autoPlayInterval?: number;
    arrows?: boolean ;
}

export const ImageSlider = ({ images, autoPlay = true, autoPlayInterval = 3000, arrows = false }: ImageSliderProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, [images.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }, [images.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    useEffect(() => {
        if (!autoPlay || images.length <= 1) return;

        const interval = setInterval(nextSlide, autoPlayInterval);
        return () => clearInterval(interval);
    }, [autoPlay, autoPlayInterval, nextSlide, images.length]);

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className="image-slider">
            <div className="image-slider__container">
                <div 
                    className="image-slider__track"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {images.map((image, index) => (
                        <div key={index} className="image-slider__slide">
                            <img src={image} alt={`Slide ${index + 1}`} />
                        </div>
                    ))}
                </div>

                {images.length > 1 && arrows && (
                    <>
                        <button 
                            className="image-slider__button image-slider__button--prev"
                            onClick={prevSlide}
                            aria-label="Previous slide"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <button 
                            className="image-slider__button image-slider__button--next"
                            onClick={nextSlide}
                            aria-label="Next slide"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="image-slider__dots">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            className={`image-slider__dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

