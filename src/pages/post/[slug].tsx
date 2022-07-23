import { GetStaticPaths, GetStaticProps } from 'next';

import Head from 'next/head';
import { title } from 'process';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatDate } from '../../lib/formatDate';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const readingTime =
    Math.round(
      post?.data.content.reduce((acc, group) => {
        let currentAcc = acc;

        const words = RichText.asText(group.body).split(' ');

        currentAcc += words.length;

        return currentAcc;
      }, 0) / 200
    ) + 1;

  const router = useRouter();

  return (
    <>
      <Head>
        <title>{`${title} | spacetraveling`}</title>
      </Head>
      <Header />
      <div className={styles.bannerContainer}>
        <img
          src={post?.data.banner.url}
          alt="Post banner"
          className={styles.banner}
        />
      </div>

      <main className={`${commonStyles.container} ${styles.main}`}>
        {!router.isFallback && post ? (
          <>
            <section className={styles.content}>
              <h1>{post.data.title}</h1>

              <div className={styles.infos}>
                <FiCalendar />
                <time>{formatDate(post.first_publication_date)}</time>
                <FiUser />
                <span>{post.data.author}</span>
                <FiClock />
                <time>{readingTime} min</time>
              </div>
              {post.data.content.map(group => {
                return (
                  <div key={group.heading} className={styles.contentGroup}>
                    <h2>{group.heading}</h2>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: RichText.asHtml(group.body),
                      }}
                    />
                  </div>
                );
              })}
            </section>
          </>
        ) : (
          <div className={styles.loading}>
            <div>
              <img src="/loading.svg" alt="" />
              <span>Carregando...</span>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');
  const postsToBuild = posts.results
    .map(post => {
      return {
        params: {
          slug: post.uid,
        },
      };
    })
    .slice(0, 2);

  return {
    paths: postsToBuild,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug));

  const post: Post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response?.data.title,
      subtitle: response?.data.subtitle,
      banner: { url: response?.data.banner.url },
      author: response?.data.author,
      content: response?.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};
