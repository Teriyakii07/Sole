
import { useState } from 'react'
import {
  Search,
  ChevronDown,
  MessageCircle,
  ShoppingBag,
  CreditCard,
  Truck,
  RefreshCw,
  Package,
} from 'lucide-react'

const faqData = [
  {
    category: 'Orders',
    icon: ShoppingBag,
    questions: [
      {
        question: 'How can I place an order?',
        answer:
          'Browse our products, select your preferred shoe, choose your size, and add it to your cart. Proceed to checkout to complete your order.',
      },
      {
        question: 'Can I cancel my order?',
        answer:
          'You may request an order cancellation before it has been shipped. Please contact our customer support team for assistance.',
      },
      {
        question: 'How can I track my order?',
        answer:
          'Once your order has been shipped, you can check its status through your account under My Orders.',
      },
    ],
  },
  {
    category: 'Payments',
    icon: CreditCard,
    questions: [
      {
        question: 'What payment methods are accepted?',
        answer:
          'Available payment methods are displayed during checkout. Select your preferred payment option before confirming your order.',
      },
      {
        question: 'Is online payment safe?',
        answer:
          'We aim to keep your shopping experience secure. Always make payments through the official SOLE. checkout process.',
      },
    ],
  },
  {
    category: 'Shipping',
    icon: Truck,
    questions: [
      {
        question: 'How long does delivery take?',
        answer:
          'Delivery time depends on your location and the courier. You can check the estimated delivery information during checkout.',
      },
      {
        question: 'Do you offer free shipping?',
        answer:
          'Shipping fees and any available free-shipping promotions will be displayed during checkout.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    icon: RefreshCw,
    questions: [
      {
        question: 'Can I return or exchange an item?',
        answer:
          'If you receive a damaged, defective, or incorrect item, please contact customer support with your order details for assistance.',
      },
      {
        question: 'How long does a refund take?',
        answer:
          'Refund processing time may depend on the payment method and verification process. Our support team can assist you with your request.',
      },
    ],
  },
  {
    category: 'Products',
    icon: Package,
    questions: [
      {
        question: 'How do I choose the right shoe size?',
        answer:
          'Check the available size information on each product page. If you are unsure, contact our support team before placing your order.',
      },
      {
        question: 'Are the products authentic?',
        answer:
          'SOLE. aims to provide customers with authentic products. Check the product information and official store details before purchasing.',
      },
    ],
  },
]

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const categories = ['All', ...faqData.map((item) => item.category)]

  const filteredFAQs = faqData
    .map((group) => ({
      ...group,
      questions: group.questions.filter((item) => {
        const matchesSearch =
          item.question.toLowerCase().includes(search.toLowerCase()) ||
          item.answer.toLowerCase().includes(search.toLowerCase())

        const matchesCategory =
          activeCategory === 'All' ||
          activeCategory === group.category

        return matchesSearch && matchesCategory
      }),
    }))
    .filter((group) => group.questions.length > 0)

  return (
    <div className="min-h-screen bg-[#F5F6F8]">

      {/* Hero Section */}
      <section className="bg-[#123A8C] px-5 py-16 text-center text-white">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-200">
          Customer Support
        </p>

        <h1 className="text-3xl font-extrabold md:text-4xl">
          Frequently Asked{' '}
          <span className="text-[#D7192D]">Questions</span>
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-blue-100 md:text-base">
          Have questions about your shopping experience?
          Find answers to the most common questions below.
        </p>

        {/* Search */}
        <div className="mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg">
          <Search size={20} className="shrink-0 text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setOpenQuestion(null)
            }}
            placeholder="Search for a question..."
            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />
        </div>
      </section>

      {/* FAQ Content */}
      <section className="mx-auto max-w-5xl px-5 py-12">

        {/* Categories */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category)
                setOpenQuestion(null)
              }}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeCategory === category
                  ? 'bg-[#123A8C] text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-[#123A8C] hover:text-[#123A8C]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((group) => {
              const Icon = group.icon

              return (
                <div key={group.category}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2.5 text-[#123A8C]">
                      <Icon size={20} />
                    </div>

                    <h2 className="text-lg font-bold text-[#123A8C]">
                      {group.category}
                    </h2>

                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  <div className="space-y-3">
                    {group.questions.map((item) => {
                      const questionId = `${group.category}-${item.question}`
                      const isOpen = openQuestion === questionId

                      return (
                        <div
                          key={questionId}
                          className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                        >
                          <button
                            onClick={() =>
                              setOpenQuestion(
                                isOpen ? null : questionId
                              )
                            }
                            className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-blue-50/50"
                          >
                            <span className="text-sm font-semibold text-gray-800 md:text-base">
                              {item.question}
                            </span>

                            <ChevronDown
                              size={20}
                              className={`shrink-0 text-[#123A8C] transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {isOpen && (
                            <div className="border-t border-gray-100 px-5 py-5">
                              <p className="text-sm leading-7 text-gray-500">
                                {item.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="rounded-xl bg-white px-5 py-12 text-center shadow-sm">
              <Search
                size={35}
                className="mx-auto mb-3 text-gray-300"
              />

              <h3 className="font-bold text-gray-800">
                No questions found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try another search or select a different category.
              </p>

              <button
                onClick={() => {
                  setSearch('')
                  setActiveCategory('All')
                }}
                className="mt-4 text-sm font-semibold text-[#D7192D] hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section className="px-5 pb-16">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#D7192D]">
            <MessageCircle size={27} />
          </div>

          <h2 className="text-2xl font-bold text-[#123A8C]">
            Still have questions?
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
            Can't find the answer you're looking for?
            Our customer support team is here to help.
          </p>

          <a
            href="mailto:support@sole.com"
            className="mt-6 inline-flex rounded-lg bg-[#D7192D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Contact Support
          </a>
        </div>
      </section>

    </div>
  )
}
