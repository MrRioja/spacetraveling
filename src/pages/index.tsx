import { GetStaticProps } from 'next';

import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';
import { formatDate } from '../lib/formatDate';

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

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { next_page } = postsPagination;
  const [posts, setPosts] = useState(postsPagination.results);

  const handleLoadMorePosts = async (): Promise<void> => {
    const response = await fetch('link');
    const data = await response.json();

    setPosts([...posts, ...data.results]);
  };

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <Header homePage />
      <main className={`${styles.main} ${commonStyles.container}`}>
        <div className={styles.content}>
          {posts.map(post => {
            return (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.infos}>
                    <FiCalendar width={20} height={20} />
                    <time>{formatDate(post.first_publication_date)}</time>
                    <FiUser width={20} height={20} />
                    <span>{post.data.author}</span>
                  </div>
                </a>
              </Link>
            );
          })}
          {next_page && (
            <button type="button" onClick={handleLoadMorePosts}>
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('posts');

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page,
      },
    },
  };
};
