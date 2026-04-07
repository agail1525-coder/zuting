import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { QuestionItem, AnswerItem, fetchQuestion } from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function QuestionDetailPage() {
  const { t } = useTranslation()
  const [question, setQuestion] = useState<(QuestionItem & { answers: AnswerItem[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useLoad((params) => {
    const id = params?.id
    if (id) {
      loadQuestion(id)
    } else {
      setError(t('questionDetail.missingId'))
      setLoading(false)
    }
  })

  const loadQuestion = async (id: string) => {
    try {
      setLoading(true)
      const data = await fetchQuestion(id)
      setQuestion(data)
    } catch {
      setError(t('questionDetail.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <View className='question-detail'>
        <View className='loading'>
          <Text className='loading__text'>{t('common.loading')}</Text>
        </View>
      </View>
    )
  }

  if (error || !question) {
    return (
      <View className='question-detail'>
        <View className='error'>
          <Text className='error__text'>{error || t('questionDetail.notFound')}</Text>
        </View>
      </View>
    )
  }

  const answers = Array.isArray(question.answers) ? question.answers : []
  const acceptedAnswer = answers.find(a => a.isAccepted)
  const otherAnswers = answers.filter(a => !a.isAccepted)
  const sortedAnswers = acceptedAnswer ? [acceptedAnswer, ...otherAnswers] : otherAnswers

  return (
    <ScrollView className='question-detail' scrollY>
      {/* Question Block */}
      <View className='question-block'>
        <Text className='question-block__title'>{question.title}</Text>
        {question.content ? (
          <Text className='question-block__content'>{question.content}</Text>
        ) : null}
        {question.tags.length > 0 && (
          <View className='question-block__tags'>
            {question.tags.map(tag => (
              <Text key={tag} className='question-block__tag'>#{tag}</Text>
            ))}
          </View>
        )}
        <View className='question-block__meta'>
          <Text className='question-block__stat'>{'\u{1F441}'} {question.viewCount}</Text>
          <Text className='question-block__stat'>{'\u{1F4AC}'} {t('questionDetail.answerCount', { count: question.answerCount })}</Text>
          <Text className={`question-block__status ${question.status === 'SOLVED' ? 'question-block__status--solved' : 'question-block__status--open'}`}>
            {question.status === 'SOLVED' ? t('questionDetail.statusSolved') : t('questionDetail.statusOpen')}
          </Text>
        </View>
      </View>

      {/* Answers */}
      <View className='answers-header'>
        <Text className='answers-header__title'>{t('questionDetail.allAnswers')}</Text>
        <Text className='answers-header__count'>({answers.length})</Text>
      </View>

      {sortedAnswers.length === 0 ? (
        <View className='empty-answers'>
          <Text className='empty-answers__icon'>{'\u{1F4AD}'}</Text>
          <Text className='empty-answers__text'>{t('questionDetail.noAnswers')}</Text>
        </View>
      ) : (
        sortedAnswers.map(answer => (
          <View
            key={answer.id}
            className={`answer-card ${answer.isAccepted ? 'answer-card--accepted' : ''}`}
          >
            {answer.isAccepted && (
              <Text className='answer-card__accepted-badge'>{t('questionDetail.bestAnswer')}</Text>
            )}
            <Text className='answer-card__content'>{answer.content}</Text>
            <View className='answer-card__footer'>
              <Text className='answer-card__time'>{formatDate(answer.createdAt)}</Text>
              <View className='answer-card__vote'>
                <Text className='answer-card__vote-icon'>{'\u{1F44D}'}</Text>
                <Text className='answer-card__vote-count'>{answer.voteCount}</Text>
              </View>
            </View>
          </View>
        ))
      )}

      <View style={{ height: '60rpx' }} />
    </ScrollView>
  )
}
