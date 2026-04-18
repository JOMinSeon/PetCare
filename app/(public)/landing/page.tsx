'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ChevronRight, Heart, Activity, Shield, Users, Star, CheckCircle, Phone, Mail, MapPin } from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: 'AI 건강 모니터링',
    desc: '실시간으로 반려동물 건강 상태를 분석하고 이상 징후를 조기에 감지합니다.',
    color: '#FF6B6B',
  },
  {
    icon: Activity,
    title: '스마트 활동 추적',
    desc: '걸음 수, 수면 시간, 칼로리 소모량을 자동으로 기록하고 분석합니다.',
    color: '#4ECDC4',
  },
  {
    icon: Shield,
    title: '병원 연동 서비스',
    desc: '동물병원과 실시간 연동하여 진료 이력을 자동으로 동기화합니다.',
    color: '#45B7D1',
  },
  {
    icon: Users,
    title: '전문 수의사 상담',
    desc: '24시간 언제든지 전문 수의사 팀과 직접 상담할 수 있습니다.',
    color: '#96CEB4',
  },
];

const testimonials = [
  {
    name: '김지훈',
    pet: '포메라니안 “뭉이”',
    content: '반려동물 건강 관리에不安이 많았는데, 펫헬스 덕분에 훨씬 체계적으로 관리하게 됐어요.',
    rating: 5,
  },
  {
    name: '이수진',
    pet: '골든 리트리버 “돌이”',
    content: 'AI 상담이 정말 유용해요. 밤에 무슨 일 생겼을 때 바로 물어볼 수 있어서心安합니다.',
    rating: 5,
  },
  {
    name: '박민수',
    pet: '코코스피츠 “냥냥”',
    content: '사료 분석 기능이 최고예요. 어떤 사료가 내 고양이에게 좋은지 바로 알 수 있어요.',
    rating: 5,
  },
];

const plans = [
  { name: '무료', price: '₩0', features: ['반려동물 1마리', 'AI 상담 30회/월', '기본 건강 기록'] },
  { name: '프리미엄', price: '₩29,900', features: ['반려동물 3마리', 'AI 상담 무제한', '건강 리포트', '수의사 상담 3회'] },
  { name: '병원용', price: '₩99,000', features: ['반려동물 무제한', 'AI 상담 무제한', 'EMR 연동', '전화 상담'] },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                <span className="text-white text-xl">🐾</span>
              </div>
              <span className="text-xl font-bold text-gray-900">PetCare</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-orange-500 transition-colors">기능</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-orange-500 transition-colors">사용방법</a>
              <a href="#pricing" className="text-gray-600 hover:text-orange-500 transition-colors">요금제</a>
              <a href="#reviews" className="text-gray-600 hover:text-orange-500 transition-colors">후기</a>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="hidden md:block text-gray-600 hover:text-orange-500 transition-colors">
                로그인
              </Link>
              <Link href="/auth/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-semibold transition-colors">
                시작하기
              </Link>
              <button
                className="md:hidden p-2 text-gray-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-600 py-2">기능</a>
              <a href="#how-it-works" className="text-gray-600 py-2">사용방법</a>
              <a href="#pricing" className="text-gray-600 py-2">요금제</a>
              <a href="#reviews" className="text-gray-600 py-2">후기</a>
              <Link href="/auth/login" className="text-gray-600 py-2">로그인</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                AI 기반 반려동물 건강 관리
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                소중한 반려동물의
                <br />
                <span className="text-orange-500">건강한 미래</span>를
                <br />
                함께 만들어요
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                과학적 데이터와 AI 기술로 반려동물의 건강을 관리하고,
                <br />
                행복한 동행生活的을 만들어 드립니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors">
                  무료로 시작하기 <ChevronRight size={18} />
                </Link>
                <a href="#how-it-works" className="border-2 border-gray-200 hover:border-orange-300 text-gray-700 px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors">
                  더 알아보기
                </a>
              </div>
              <div className="flex items-center gap-8 mt-10">
                <div className="flex -space-x-3">
                  {['🐕', '🐈', '🐰', '🦜'].map((emoji, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-white border-2 border-white flex items-center justify-center text-xl shadow-sm">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">10,000+</div>
                  <div className="text-sm text-gray-500">반려동물 보호자</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <span className="text-[200px]">🐕‍🦺</span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-400 rounded-full opacity-50 blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-300 rounded-full opacity-40 blur-xl"></div>

              {/* Floating Stats */}
              <div className="absolute -left-4 top-1/4 bg-white rounded-2xl shadow-lg p-4 z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">98%</div>
                    <div className="text-xs text-gray-500">정확도</div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 bottom-1/4 bg-white rounded-2xl shadow-lg p-4 z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">24/7</div>
                    <div className="text-xs text-gray-500">모니터링</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              왜 펫헬스인가?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              첨단 AI 기술과 전문 수의사团队的 역량을 결합하여
              <br />
              반려동물 건강 관리의 새로운 기준을 만들어갑니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              간단한 3단계로 시작하세요
            </h2>
            <p className="text-gray-600 text-lg">
              복잡한 설정 없이 바로 반려동물 건강 관리를 시작할 수 있습니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: '반려동물 등록', desc: '이름, 나이, 종류 등 기본 정보를 입력하세요', icon: '🐾' },
              { step: '02', title: '건강 기록 시작', desc: '매일 체중과 컨디션을 기록하세요', icon: '📝' },
              { step: '03', title: 'AI 분석 받기', desc: '맞춤형 건강 리포트와 케어 조언을 받으세요', icon: '🤖' },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gray-200" />
                )}
                <div className="bg-white rounded-2xl p-8 text-center relative z-10 shadow-sm">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    {item.icon}
                  </div>
                  <div className="inline-block bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold mb-4">
                    STEP {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              플랜을 선택하세요
            </h2>
            <p className="text-gray-600 text-lg">
              반려동물의 상태에 맞는 최적의 플랜을 선택하세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 ${
                  index === 1
                    ? 'bg-orange-500 text-white ring-4 ring-orange-300 scale-105'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {index === 1 && (
                  <div className="inline-block bg-white text-orange-500 px-3 py-1 rounded-full text-xs font-bold mb-4">
                    추천
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-2 ${index === 1 ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className={`text-4xl font-bold mb-6 ${index === 1 ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                  <span className={`text-sm font-normal ${index === 1 ? 'text-orange-100' : 'text-gray-500'}`}>/월</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 ${index === 1 ? 'text-orange-200' : 'text-orange-500'}`} />
                      <span className={index === 1 ? 'text-orange-100' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block text-center py-3 rounded-full font-semibold transition-colors ${
                    index === 1
                      ? 'bg-white text-orange-500 hover:bg-orange-50'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  시작하기
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-20 px-4 sm:px-6 lg:px-8 bg-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              보호자들이 말해요
            </h2>
            <p className="text-gray-600 text-lg">
              실제로 펫헬스를 사용하고 있는 보호자들의 후기입니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array(testimonial.rating).fill(null).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.pet.includes('포메라니안') ? '🐕' : testimonial.pet.includes('골든') ? '🐕‍🦺' : '🐈'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.pet}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            지금 바로 반려동물의 건강을 관리하세요
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            첫 달 무료 체험期間中, 언제든 취소할 수 있습니다
          </p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-white text-orange-500 px-8 py-4 rounded-full font-bold hover:bg-orange-50 transition-colors">
            무료로 시작하기 <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-xl">🐾</span>
                </div>
                <span className="text-xl font-bold text-white">PetCare</span>
              </div>
              <p className="text-sm leading-relaxed">
                AI 기반 반려동물 건강 관리 서비스로,
                <br />
                더 행복한 동행生活的을 만들어갑니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">제품</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">기능</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">요금제</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">사용방법</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">회사</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">이용약관</a></li>
                <li><a href="/refund" className="hover:text-white transition-colors">환불정책</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">연락처</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Mail size={16} /> help@petcare.kr</li>
                <li className="flex items-center gap-2"><Phone size={16} /> 1588-1234</li>
                <li className="flex items-center gap-2"><MapPin size={16} /> 서울특별시 강남구</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2026 PetCare. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}