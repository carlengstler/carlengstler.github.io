document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Reset transform for masonry items to handle the mix of animation + css offset
                if(entry.target.classList.contains('project-card')) {
                    // Check if it's an even child to maintain offset if needed, 
                    // but 'visible' class just resets opacity. 
                    // The CSS handles the final transform state.
                    const isEven = Array.from(entry.target.parentNode.children).indexOf(entry.target) % 2 !== 0;
                    if(window.innerWidth > 768 && isEven) {
                        entry.target.style.setProperty('--translate-y', '4rem');
                    } else {
                        entry.target.style.setProperty('--translate-y', '0');
                    }
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .fade-up');
    animatedElements.forEach(el => observer.observe(el));

    // Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});
