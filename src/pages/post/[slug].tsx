import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      };
    };
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Header />

      <div className={styles.postContainer}>
        <img src={post.data.banner.url} alt="banner" />
        <div className={styles.postContent}>
          <h1>{post.data.title}</h1>
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

            <span className={commonStyles.info}>
              <FiClock size={20} className={commonStyles.icon} />
              {`${Math.ceil(
                post.data.content.body.text.split(' ').length / 200
              )} min`}
            </span>
          </div>

          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.data.content.body.text }}
          />
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug));

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'd MMM y',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: {
        heading: response.data.content[0].heading,
        body: {
          text: RichText.asHtml(response.data.content[0].body),
        },
      },
    },
  };

  return {
    props: {
      post,
    },
  };
};
