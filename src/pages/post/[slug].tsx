/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import Head from 'next/head';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';

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
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const totalWords = post.data.content.reduce((total, contentItem) => {
    if (!contentItem.heading) {
      return;
    }
    total += contentItem.heading.split(' ').length;
    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(word => (total += word));
    return total;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  const formattedPostDate = (date: string): string => {
    const formattedDate = format(new Date(date), 'dd MMM yyyy', {
      locale: ptBR,
    });
    return formattedDate;
  };

  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | Spacetraveling</title>
      </Head>

      <Header />

      <main className={styles.postContainer}>
        <article className={styles.post}>
          <img
            className={styles.banner}
            src={post.data.banner.url}
            alt={post.data.title}
          />
          <div className={commonStyles.container}>
            <h1>{post.data.title}</h1>
            <div className={commonStyles.infos}>
              <span>
                <img src="/images/calendar.png" alt="calendar" />
                {formattedPostDate(post.first_publication_date)}
              </span>
              <span>
                <img src="/images/author.png" alt="author" />
                {post.data.author}
              </span>
              <span>
                <img src="/images/clock.png" alt="author" /> 4 min
              </span>
            </div>

            <div className={styles.content}>
              {post.data.content.map(content => {
                return (
                  <div key={content.heading}>
                    <h2>{content?.heading}</h2>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: RichText.asHtml(content.body),
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    { fetch: ['posts.uid'], pageSize: 3 }
  );

  return {
    paths: posts.results.map(post => {
      return {
        params: {
          slug: post.uid,
        },
      };
    }),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: { post },
  };
};
