(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  $('#year').textContent = new Date().getFullYear();

  // Menu mobile
  const menuBtn = $('.menu-btn'), menu = $('#menu');
  menuBtn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', false);
  }));

  // Cards expansíveis
  $$('.card').forEach(c => {
    const toggle = () => c.classList.toggle('open');
    c.addEventListener('click', toggle);
    c.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  // Animação ao rolar
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));

  // Questionário
  const steps = $$('.step'), bar = $('#bar'), err = $('#error');
  const prev = $('#prev'), next = $('#next');
  const form = $('#recipe-form'), result = $('#result');
  let current = 0;
  const answers = { feeling: '', area: '', habits: [], time: '', obstacle: '' };

  $$('.options').forEach(group => {
    const name = group.dataset.name, multi = group.dataset.type === 'checkbox';
    $$('.chip', group).forEach(chip => chip.addEventListener('click', () => {
      const v = chip.dataset.value;
      if (multi) {
        chip.classList.toggle('selected');
        answers[name] = $$('.chip.selected', group).map(c => c.dataset.value);
      } else {
        $$('.chip', group).forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        answers[name] = v;
      }
      err.textContent = '';
    }));
  });

  function show(i) {
    current = i;
    steps.forEach((s, k) => s.classList.toggle('active', k === i));
    bar.style.width = ((i + 1) / steps.length * 100) + '%';
    prev.style.visibility = i === 0 ? 'hidden' : 'visible';
    next.textContent = i === steps.length - 1 ? 'Gerar minha receita' : 'Próximo';
  }

  function valid() {
    const name = $('.options', steps[current]).dataset.name;
    const v = answers[name];
    return Array.isArray(v) ? v.length > 0 : !!v;
  }

  prev.addEventListener('click', () => current > 0 && show(current - 1));
  next.addEventListener('click', () => {
    if (!valid()) { err.textContent = 'Escolha pelo menos uma opção para continuar 🌱'; return; }
    if (current < steps.length - 1) show(current + 1);
    else generate();
  });

  // Conteúdo da receita
  const feelingMsg = {
    cansado: 'Seu corpo está pedindo gentileza. Vamos priorizar descanso e energia leve.',
    estressado: 'Vamos desacelerar: pausas curtas e respiração farão diferença hoje.',
    ansioso: 'Vamos acalmar a mente com rotinas simples e previsíveis.',
    tranquilo: 'Que bom! Vamos manter esse equilíbrio e fortalecer seus hábitos.',
    animado: 'Ótima energia! Vamos transformá-la em hábitos que durem.'
  };
  const habitTips = {
    agua: ['💧 Beber mais água', 'Deixe uma garrafa à vista e beba um copo ao acordar, antes de cada refeição e ao fim do dia.'],
    exercicio: ['🏋️ Fazer exercícios', 'Comece com uma caminhada ou alongamento e aumente aos poucos, no seu ritmo.'],
    sono: ['🌙 Dormir cerca de 8 horas', 'Defina um horário fixo para deitar e desligue as telas 30 minutos antes.'],
    frutas: ['🍎 Comer frutas', 'Inclua uma fruta no café da manhã e outra como lanche da tarde.'],
    relaxar: ['🧘 Tempo para relaxar', 'Reserve alguns minutos para respirar fundo (4-4-6), ouvir uma música calma ou ficar em silêncio.'],
    familia: ['👨‍👩‍👧 Tempo com a família', 'Faça uma refeição sem celular com quem você ama ou combine uma ligação.']
  };
  const areaTips = {
    alimentacao: 'Monte um prato colorido: metade legumes e verduras, o resto entre proteínas e grãos integrais.',
    fisica: 'Escolha uma atividade que você goste e faça-a em horário fixo para virar rotina.',
    mental: 'Anote uma coisa pela qual é grato(a) e uma que você deixa de lado hoje.',
    sono: 'Crie um ritual noturno: luz baixa, chá sem cafeína e leitura leve.',
    relacionamentos: 'Mande hoje uma mensagem sincera para alguém importante para você.'
  };
  const obstacleTips = {
    tempo: 'Use micro-hábitos de 2 a 5 minutos encaixados em momentos que já existem na rotina.',
    motivacao: 'Comece pequeno e marque cada conquista. A motivação vem com a ação.',
    cansaco: 'Priorize o sono e escolha atividades suaves; respeitar seu limite também é cuidado.',
    organizacao: 'Escolha no máximo 2 hábitos por semana e deixe-os visíveis em um lembrete.',
    esquecimento: 'Associe cada hábito a algo que você já faz, como escovar os dentes ou tomar café.'
  };
  const timePlan = {
    10: ['10 minutos', '2 min de respiração, 5 min de alongamento ou caminhada e 3 min para beber água e planejar o dia.'],
    30: ['30 minutos', '20 min de movimento, 5 min de relaxamento e 5 min preparando um lanche saudável.'],
    60: ['1 hora', '30 min de movimento, 15 min de relaxamento ou conexão com alguém e 15 min cuidando da alimentação.']
  };

  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function generate() {
    const a = answers;
    const habits = a.habits.map(h => `<li><strong>${esc(habitTips[h][0])}:</strong> ${esc(habitTips[h][1])}</li>`).join('');
    const [tLabel, tPlan] = timePlan[a.time];
    result.innerHTML = `
      <h3>🌿 Sua Receita de Bem-Estar</h3>
      <p class="intro">${esc(feelingMsg[a.feeling])}</p>
      <h4>Ingredientes diários (${esc(tLabel)})</h4>
      <ul><li>${esc(tPlan)}</li></ul>
      <h4>Seus hábitos</h4>
      <ul>${habits}</ul>
      <h4>Foco principal</h4>
      <ul><li>${esc(areaTips[a.area])}</li></ul>
      <h4>Para superar o que dificulta</h4>
      <ul><li>${esc(obstacleTips[a.obstacle])}</li></ul>
      <h4>Modo de preparo</h4>
      <ul><li>Pratique por 7 dias, sem cobrança. Se um dia falhar, recomece no seguinte. Pequenas escolhas, repetidas, cultivam grandes mudanças.</li></ul>
      <p class="note">Esta receita é inspiracional e não substitui orientação de médicos, nutricionistas ou psicólogos.</p>
      <div class="btns">
        <button class="btn" id="print">Salvar / imprimir</button>
        <button class="btn ghost" id="redo">Refazer</button>
      </div>`;
    form.hidden = true;
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('#print').addEventListener('click', () => window.print());
    $('#redo').addEventListener('click', reset);
  }

  function reset() {
    Object.assign(answers, { feeling: '', area: '', habits: [], time: '', obstacle: '' });
    $$('.chip.selected').forEach(c => c.classList.remove('selected'));
    result.hidden = true;
    form.hidden = false;
    show(0);
    $('#receita').scrollIntoView({ behavior: 'smooth' });
  }

  show(0);
})();
