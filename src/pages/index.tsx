import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';

import Head from 'next/head';

import React, { useState } from 'react';
import Link from 'next/link';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/router';
import styles from './home.module.scss';
import Header from '../components/Header';
import commonStyles from '../styles/common.module.scss';
import { getPrismicClient } from '../services/prismic';

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

const Home: React.FC<HomeProps> = ({ postsPagination }) => {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const handleMorePosts = async (): Promise<void> => {
    const postsResponse = await fetch(nextPage).then(response =>
      response.json()
    );

    const formattedPosts = postsResponse.results.map((post): Post => {
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

    setNextPage(postsResponse.next_page);
    setPosts(old => [...old, ...formattedPosts]);
  };

  const formattedPostDate = (date: string): string => {
    const formattedDate = format(new Date(date), 'dd MMM yyyy', {
      locale: ptBR,
    });
    return formattedDate;
  };

  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>

      <Header />

      <main className={`${commonStyles.container} ${styles.homeContainer}`}>
        <ul className={styles.posts}>
          {posts.map(post => (
            <li key={post.uid} className={styles.post}>
              <Link href={`/post/${post.uid}`}>
                <a>
                  <h2>{post.data.title}</h2>
                  <p>{post.data.subtitle}</p>
                  <div className={commonStyles.infos}>
                    <span>
                      <img src="/images/calendar.png" alt="calendar" />
                      {formattedPostDate(post.first_publication_date)}
                    </span>
                    <span>
                      <img src="/images/author.png" alt="author" />
                      {post.data.author}
                    </span>
                  </div>
                </a>
              </Link>
            </li>
          ))}
        </ul>
        {nextPage && (
          <span
            aria-hidden="true"
            onClick={handleMorePosts}
            className={styles.loadMore}
          >
            Carregar mais posts
          </span>
        )}
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author', 'posts.content'],
      pageSize: 2,
    }
  );

  const posts = postsResponse.results.map((post): Post => {
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

  console.log(posts);

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};

export default Home;
