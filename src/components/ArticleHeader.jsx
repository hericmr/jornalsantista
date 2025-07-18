
import React from 'react';
import PropTypes from 'prop-types';

/**
 * ArticleHeader component displays the authors' avatars, names, and the publication date.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.authors - An array of author objects.
 * @param {string} props.authors[].name - The author's name.
 * @param {string} props.authors[].avatarUrl - The URL for the author's avatar image.
 * @param {string} props.authors[].profileUrl - The URL for the author's profile page.
 * @param {string} props.publishedDate - The publication date of the article.
 */
const ArticleHeader = ({ authors, publishedDate }) => {
  // Inline styles to mimic Tailwind CSS classes
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      paddingBottom: '1.25rem',
      paddingTop: '1rem',
    },
    avatarContainer: {
      display: 'flex',
      gap: '0.5rem',
    },
    avatarLink: {
      borderRadius: '9999px',
      overflow: 'hidden',
    },
    avatarImage: {
      width: '32px',
      height: '32px',
      objectFit: 'cover',
    },
    infoContainer: {
      display: 'flex',
      flexDirection: 'column',
    },
    authorsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
    },
    authorLink: {
      textDecoration: 'none',
      color: '#374151', // text-gray-700
      fontWeight: '600', // font-semibold
    },
    date: {
      fontSize: '0.875rem', // text-sm
      color: '#6b7280', // text-gray-500
      marginTop: '0.25rem',
    },
  };

  return (
    <div style={styles.container} className="flex items-center gap-4 py-4">
      {/* Avatars */}
      <div style={styles.avatarContainer} className="flex gap-2">
        {authors.map((author, index) => (
          <a
            key={index}
            href={author.profileUrl}
            style={styles.avatarLink}
            className="rounded-full overflow-hidden"
            aria-label={`Perfil de ${author.name}`}
          >
            <img
              src={author.avatarUrl}
              alt={`Avatar de ${author.name}`}
              style={styles.avatarImage}
              className="w-8 h-8 object-cover"
            />
          </a>
        ))}
      </div>

      {/* Author Names and Date */}
      <div style={styles.infoContainer} className="flex flex-col">
        <div style={styles.authorsContainer} className="flex flex-wrap gap-2">
          {authors.map((author, index) => (
            <a
              key={index}
              href={author.profileUrl}
              style={styles.authorLink}
              className="text-gray-700 font-semibold hover:underline"
            >
              {author.name}
              {index < authors.length - 1 && ','}
            </a>
          ))}
        </div>
        <time style={styles.date} className="text-sm text-gray-500 mt-1">
          {publishedDate}
        </time>
      </div>
    </div>
  );
};

ArticleHeader.propTypes = {
  authors: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      avatarUrl: PropTypes.string.isRequired,
      profileUrl: PropTypes.string.isRequired,
    })
  ).isRequired,
  publishedDate: PropTypes.string.isRequired,
};

export default ArticleHeader;
