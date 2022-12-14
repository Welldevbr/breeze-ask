import { FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { database } from '../services/firebase';

import { User } from 'phosphor-react'
import toast, { Toaster } from 'react-hot-toast';

import logo from '../assets/Logo.svg'
import illustration from '../assets/Chat.svg'

import { Button } from '../components/Button'
import { RoomCode } from '../components/RoomCode'
import { Question } from '../components/Question';

import { useAuth } from '../hooks/useAuth';
import { useRoom } from '../hooks/useRoom'

import '../styles/room.scss'
import cx from 'classnames'


type RoomParams = {
  id: string;
}

export function Room()  {
  const { user } = useAuth()

  const params = useParams<RoomParams>()
  const roomId: string | any = params.id

  const [newQuestion, setNewQuestion] = useState('')
  const { questions, title } = useRoom( roomId )
  const [likes, setLikes] = useState<number | any>(0)

  /*
  useEffect(() => {
    if (likes >= 1){
        questions.map(question => question.isHighLighted = true)
    }
  }, [likes, questions])
  */

  async function handleSendQuestion(event: FormEvent) {
    event.preventDefault()

    if (newQuestion.trim() === '') {
      toast.error('Por favor informe a sua prgunta!', {
        duration: 2000,
        position: 'top-center',
        
        //* Style
        style: {
          background: 'rgba( 255, 255, 255, 0.35 )',
          backdropFilter: 'blur(13.5px)',
          WebkitBackdropFilter: 'blur(13.5px)',
        }
      });
      return;
    }

    if (!user) {
      toast.error('Código copiado com sucesso');
    }

    const question = {
      content: newQuestion,
      author: {
        name: user?.name,
        avatar: user?.avatar,
      },
      isHighLighted: false,
      isAnswered: false,
    }

    await database.ref(`rooms/${roomId}/questions`).push(question)
    toast.success('Pergunta enviada com sucesso 😊', {
        duration: 2000,
        position: 'top-center',
        
        //* Style
        style: {
          background: 'rgba( 255, 255, 255, 0.35 )',
          backdropFilter: 'blur(13.5px)',
          WebkitBackdropFilter: 'blur(13.5px)',
        },
      });
    setNewQuestion('')
  }

  async function handleLikeQuestion(questionId: string, likeId: string |undefined){
    if(likeId){
      await database.ref(`rooms/${roomId}/questions/${questionId}/likes/${likeId}`).remove()
    } else {
      await database.ref(`rooms/${roomId}/questions/${questionId}/likes`).push({
        authorId: user?.id,
      })
    }
    const likesTotal = questions.find(question => questionId === question.id)
    setLikes(likesTotal?.likeCount)
  }

  

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logo} alt="letmeask" />
          <div>
            <RoomCode code={roomId} />
          </div>
        </div>
      </header>

      <main className="cont">
        <div className="room-title">
          <h1>Sala:  {title}</h1>
            { 
              questions.length >  0 && <span>{ questions.length } pergunta(s)</span>
            }
        </div>

        <form onSubmit={handleSendQuestion}>
          <textarea
            placeholder='Qual é a sua dúvida?'
            onChange={event => setNewQuestion(event.target.value)}
            value={newQuestion}
          />

          <div className="form-footer">
            {
              user ? (
                <div className='user-info'>
                  {
                    user.avatar ? (
                      <img src={user.avatar} alt="Perfil" />
                    ) : (
                      <div className="avatar">
                        <User
                          weight='bold'
                          color='#fff' 
                        />
                      </div>
                    )
                  }
                  <span className="title">
                    <p>{user.name}</p>
                    <small>{/* <b>Setor:</b> user.sector*/}</small>
                  </span>
                </div>
              ) :
              (<span >Para enviar uma pergunto, <Link className='link' to="/">faça seu login.</Link></span>)
            }
            
            <Button 
              type="submit"
              disabled={!user}
            >
              Enviar pergunta
            </Button>
            <Toaster
              position="top-right"
            />
          </div>
        </form>
      
        <div className="questions-list">
          <div className="questions-highlighted">
            {
              questions.length >  0 && (
                questions.map(question => {
                  const boo = question.isHighLighted && !question.isAnswered;
                    return (
                      boo && (
                        !question.isAnswered && (
                          <Question
                              key={question.id}
                              content={question.content} 
                              author={question.author}
                              isAnswered={question.isAnswered}
                              isHighLighted={question.isHighLighted}
                            >
                            { !question.isAnswered && (
                                <button
                                  className={cx(
                                    'like-button', 
                                    { liked: question.likeId } 
                                  )}
                                  type='button'
                                  aria-label='Marcar como gostei'
                                  onClick={() => handleLikeQuestion(question.id, question.likeId)}
                                >
                                  { question.likeCount > 0 && <span>{ question.likeCount }</span> }
                                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V12C1 11.4696 1.21071 10.9609 1.58579 10.5858C1.96086 10.2107 2.46957 10 3 10H6M13 8V4C13 3.20435 12.6839 2.44129 12.1213 1.87868C11.5587 1.31607 10.7956 1 10 1L6 10V21H17.28C17.7623 21.0055 18.2304 20.8364 18.5979 20.524C18.9654 20.2116 19.2077 19.7769 19.28 19.3L20.66 10.3C20.7035 10.0134 20.6842 9.72068 20.6033 9.44225C20.5225 9.16382 20.3821 8.90629 20.1919 8.68751C20.0016 8.46873 19.7661 8.29393 19.5016 8.17522C19.2371 8.0565 18.9499 7.99672 18.66 8H13Z" stroke="#737380" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )
                            } 
                          </Question>
                        )    
                      )   
                    )
                })
              )
            }
          </div>

          <div className="questions-normal">
            {
              questions.length >  0 ? (
                questions.map(question => {
                  const booleanQuest = !question.isHighLighted && !question.isAnswered;
                    return (
                      booleanQuest && (
                        <Question
                            key={question.id}
                            content={question.content} 
                            author={question.author}
                            isAnswered={question.isAnswered}
                            isHighLighted={question.isHighLighted}
                          >
                          { !question.isAnswered && (
                              <button
                                className={cx(
                                  'like-button', 
                                  { liked: question.likeId } 
                                )}
                                type='button'
                                aria-label='Marcar como gostei'
                                onClick={() => handleLikeQuestion(question.id, question.likeId)}
                              >
                                { question.likeCount > 0 && <span>{ question.likeCount }</span> }
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M6 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V12C1 11.4696 1.21071 10.9609 1.58579 10.5858C1.96086 10.2107 2.46957 10 3 10H6M13 8V4C13 3.20435 12.6839 2.44129 12.1213 1.87868C11.5587 1.31607 10.7956 1 10 1L6 10V21H17.28C17.7623 21.0055 18.2304 20.8364 18.5979 20.524C18.9654 20.2116 19.2077 19.7769 19.28 19.3L20.66 10.3C20.7035 10.0134 20.6842 9.72068 20.6033 9.44225C20.5225 9.16382 20.3821 8.90629 20.1919 8.68751C20.0016 8.46873 19.7661 8.29393 19.5016 8.17522C19.2371 8.0565 18.9499 7.99672 18.66 8H13Z" stroke="#737380" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            )
                          } 
                        </Question>
                      )       
                    )
                })
              ):(
                <div className='not-questions'>
                  <img src={ illustration } alt="" />
                  <strong>
                    Nenhuma pergunta por aqui...
                  </strong>
                  <span>
                    Faça o seu login e seja a primeira pessoa a <br />
                    fazer uma pergunta!
                  </span>
                </div>
              )
            }
          </div>
          
          <div className="questions-answered">
            {
              questions.length >  0 && (
                questions.map(question => {
                  return (
                    question.isAnswered && (
                      <Question
                          key={question.id}
                          content={question.content} 
                          author={question.author}
                          isAnswered={question.isAnswered}
                          isHighLighted={question.isHighLighted}
                        >
                        { !question.isAnswered && (
                            <button
                              className={cx(
                                'like-button', 
                                { liked: question.likeId } 
                              )}
                              type='button'
                              aria-label='Marcar como gostei'
                              onClick={() => handleLikeQuestion(question.id, question.likeId)}
                            >
                              { question.likeCount > 0 && <span>{ question.likeCount }</span> }
                              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V12C1 11.4696 1.21071 10.9609 1.58579 10.5858C1.96086 10.2107 2.46957 10 3 10H6M13 8V4C13 3.20435 12.6839 2.44129 12.1213 1.87868C11.5587 1.31607 10.7956 1 10 1L6 10V21H17.28C17.7623 21.0055 18.2304 20.8364 18.5979 20.524C18.9654 20.2116 19.2077 19.7769 19.28 19.3L20.66 10.3C20.7035 10.0134 20.6842 9.72068 20.6033 9.44225C20.5225 9.16382 20.3821 8.90629 20.1919 8.68751C20.0016 8.46873 19.7661 8.29393 19.5016 8.17522C19.2371 8.0565 18.9499 7.99672 18.66 8H13Z" stroke="#737380" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )
                        } 
                      </Question>
                    )
                  )
                })
              )
            }
          </div>
        </div>

      </main>
    </div>
  )
}