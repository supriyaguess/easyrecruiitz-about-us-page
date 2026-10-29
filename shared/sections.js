// Interactive bits of the new sections: testimonial carousel and the "where to start" picker.
(function () {
  // ---- testimonials ----
  document.querySelectorAll('.tm').forEach(tm => {
    const slides = [...tm.querySelectorAll('.tm-slide')];
    const dots = tm.querySelector('.tm-dots');
    let i = 0, timer = null;
    const show = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      dots.querySelectorAll('button').forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    };
    slides.forEach((_, k) => {
      const d = document.createElement('button'); d.type = 'button'; d.setAttribute('aria-label', 'Show story ' + (k + 1));
      d.addEventListener('click', () => { show(k); restart(); }); dots.appendChild(d);
    });
    tm.querySelector('.tm-prev').addEventListener('click', () => { show(i - 1); restart(); });
    tm.querySelector('.tm-next').addEventListener('click', () => { show(i + 1); restart(); });
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = () => { if (!reduce) timer = setInterval(() => show(i + 1), 7000); };
    const restart = () => { clearInterval(timer); start(); };
    tm.addEventListener('mouseenter', () => clearInterval(timer));
    tm.addEventListener('mouseleave', restart);
    show(0); start();
  });

  // ---- picker ----
  const answers = {
    permanent: ['Permanent hiring', 'We find, screen and verify candidates for roles that matter, then bring you a shortlist to interview.', 'Talk to a recruiter', 'employer'],
    mass: ['Mass recruitment', 'A planned hiring drive for 20 or more people, run to your start dates and headcount.', 'Plan a hiring drive', 'employer'],
    temp: ['Temporary staffing', 'Flexible people for a few weeks or months, through our Temporary Staffing Division.', 'Ask about temporary staff', 'employer'],
    verify: ['Verification and assessment', 'Background checks and skill assessments for candidates you have already shortlisted.', 'Get candidates checked', 'employer'],
    seeker: ['Share your resume', 'Tell us about yourself and the role you want. A recruiter will talk to you about suitable openings.', 'Share your resume', 'seeker']
  };
  document.querySelectorAll('.pk').forEach(pk => {
    const out = pk.querySelector('.pk-out');
    const paint = key => {
      const a = answers[key]; if (!a) return;
      out.querySelector('h3').textContent = a[0];
      out.querySelector('p').textContent = a[1];
      const go = out.querySelector('.btn-go'); go.textContent = a[2]; go.dataset.audience = a[3];
      out.classList.remove('swap'); void out.offsetWidth; out.classList.add('swap');
    };
    pk.querySelectorAll('input[name="need"]').forEach(r => r.addEventListener('change', () => paint(r.value)));
  });
})();
