import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

function clearPostData(posts) {
  return posts.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'd MMM y',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
}

export default function Home({ next_page, results }: PostPagination) {
  const [posts, setPosts] = useState(results);
  const [nextPage, setNextPage] = useState(next_page);

  function loadNextPage() {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        const newPosts = clearPostData(data.results);

        setNextPage(data.next_page);
        setPosts([...posts, ...newPosts]);
      });
  }

  return (
    <>
      <Header />

      <div className={styles.content}>
        <div className={styles.postsContainer}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <div className={styles.post}>
                  <h1 className={styles.postTitle}>{post.data.title}</h1>
                  <p className={styles.subtitle}>{post.data.subtitle}</p>

                  <div>
                    <span
                      className={`${commonStyles.publicationDate} ${commonStyles.info}`}
                    >
                      <FiCalendar size={20} className={commonStyles.icon} />{' '}
                      {post.first_publication_date}
                    </span>

                    <span className={commonStyles.info}>
                      <FiUser size={20} className={commonStyles.icon} />{' '}
                      {post.data.author}
                    </span>
                  </div>
                </div>
              </a>
            </Link>
          ))}

          {nextPage && (
            <button
              type="button"
              className={styles.button}
              onClick={loadNextPage}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('posts', {
    pageSize: 2,
  });

  const posts = clearPostData(response.results);

  return {
    props: {
      results: posts,
      next_page: response.next_page,
    },
  };
};
