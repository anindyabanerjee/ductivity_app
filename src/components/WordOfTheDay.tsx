/**
 * components/WordOfTheDay.tsx
 *
 * Displays a rotating "Word of the Day" card with a word,
 * pronunciation, meaning, and a motivational usage example.
 * The word changes daily based on the current date.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WordEntry {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
}

const WORDS: WordEntry[] = [
  { word: 'Resilience', pronunciation: '/rɪˈzɪl.i.əns/', partOfSpeech: 'noun', meaning: 'The capacity to recover quickly from difficulties; toughness.', example: 'Her resilience helped her bounce back after a tough week.' },
  { word: 'Serendipity', pronunciation: '/ˌser.ənˈdɪp.ɪ.ti/', partOfSpeech: 'noun', meaning: 'The occurrence of events by chance in a happy way.', example: 'Finding that book was pure serendipity.' },
  { word: 'Persevere', pronunciation: '/ˌpɜː.sɪˈvɪər/', partOfSpeech: 'verb', meaning: 'To continue in a course of action even in the face of difficulty.', example: 'If you persevere with the task, you will succeed.' },
  { word: 'Ephemeral', pronunciation: '/ɪˈfem.ər.əl/', partOfSpeech: 'adjective', meaning: 'Lasting for a very short time.', example: 'The ephemeral beauty of a sunset reminds us to be present.' },
  { word: 'Candor', pronunciation: '/ˈkæn.dər/', partOfSpeech: 'noun', meaning: 'The quality of being open, honest, and sincere.', example: 'She appreciated his candor during the feedback session.' },
  { word: 'Tenacious', pronunciation: '/tɪˈneɪ.ʃəs/', partOfSpeech: 'adjective', meaning: 'Tending to keep a firm hold; persistent and determined.', example: 'His tenacious attitude made him a great team leader.' },
  { word: 'Eloquent', pronunciation: '/ˈel.ə.kwənt/', partOfSpeech: 'adjective', meaning: 'Fluent or persuasive in speaking or writing.', example: 'Her eloquent presentation inspired the whole room.' },
  { word: 'Pragmatic', pronunciation: '/præɡˈmæt.ɪk/', partOfSpeech: 'adjective', meaning: 'Dealing with things sensibly and realistically.', example: 'A pragmatic approach to problem-solving saves time.' },
  { word: 'Ubiquitous', pronunciation: '/juːˈbɪk.wɪ.təs/', partOfSpeech: 'adjective', meaning: 'Present, appearing, or found everywhere.', example: 'Smartphones have become ubiquitous in modern life.' },
  { word: 'Catalyst', pronunciation: '/ˈkæt.əl.ɪst/', partOfSpeech: 'noun', meaning: 'A person or thing that causes an important change.', example: 'The workshop was a catalyst for her creative breakthrough.' },
  { word: 'Sanguine', pronunciation: '/ˈsæŋ.ɡwɪn/', partOfSpeech: 'adjective', meaning: 'Optimistic or positive, especially in a difficult situation.', example: 'Despite the setback, she remained sanguine about the outcome.' },
  { word: 'Altruism', pronunciation: '/ˈæl.tru.ɪ.zəm/', partOfSpeech: 'noun', meaning: 'Selfless concern for the well-being of others.', example: 'His altruism shone through his volunteer work every weekend.' },
  { word: 'Diligent', pronunciation: '/ˈdɪl.ɪ.dʒənt/', partOfSpeech: 'adjective', meaning: 'Having or showing care in one\'s work or duties.', example: 'Being diligent with small tasks builds great habits.' },
  { word: 'Luminous', pronunciation: '/ˈluː.mɪ.nəs/', partOfSpeech: 'adjective', meaning: 'Full of or shedding light; bright or shining.', example: 'Her luminous ideas lit up the brainstorming session.' },
  { word: 'Fortitude', pronunciation: '/ˈfɔː.tɪ.tjuːd/', partOfSpeech: 'noun', meaning: 'Courage in pain or adversity.', example: 'It takes fortitude to stay productive when motivation is low.' },
  { word: 'Cogent', pronunciation: '/ˈkoʊ.dʒənt/', partOfSpeech: 'adjective', meaning: 'Clear, logical, and convincing.', example: 'He made a cogent argument for starting the project early.' },
  { word: 'Ameliorate', pronunciation: '/əˈmiː.li.ə.reɪt/', partOfSpeech: 'verb', meaning: 'To make something bad or unsatisfactory better.', example: 'Small daily habits can ameliorate your overall well-being.' },
  { word: 'Zenith', pronunciation: '/ˈzen.ɪθ/', partOfSpeech: 'noun', meaning: 'The highest point reached; the peak.', example: 'She reached the zenith of her productivity this quarter.' },
  { word: 'Emulate', pronunciation: '/ˈem.jə.leɪt/', partOfSpeech: 'verb', meaning: 'To match or surpass by imitation.', example: 'Emulate the habits of those who inspire you.' },
  { word: 'Prolific', pronunciation: '/prəˈlɪf.ɪk/', partOfSpeech: 'adjective', meaning: 'Present in large numbers or quantities; plentiful.', example: 'She was prolific in her output, completing three projects this week.' },
  { word: 'Intrepid', pronunciation: '/ɪnˈtrep.ɪd/', partOfSpeech: 'adjective', meaning: 'Fearless; adventurous.', example: 'The intrepid team tackled the impossible deadline head-on.' },
  { word: 'Synergy', pronunciation: '/ˈsɪn.ər.dʒi/', partOfSpeech: 'noun', meaning: 'The combined power of a group that exceeds the total of individual efforts.', example: 'Great synergy in the team led to an incredible product launch.' },
  { word: 'Vivacious', pronunciation: '/vɪˈveɪ.ʃəs/', partOfSpeech: 'adjective', meaning: 'Attractively lively and animated.', example: 'Her vivacious energy kept the whole team motivated.' },
  { word: 'Sagacious', pronunciation: '/səˈɡeɪ.ʃəs/', partOfSpeech: 'adjective', meaning: 'Having keen mental discernment and good judgment.', example: 'A sagacious leader knows when to push and when to pause.' },
  { word: 'Exuberant', pronunciation: '/ɪɡˈzuː.bər.ənt/', partOfSpeech: 'adjective', meaning: 'Filled with lively energy and excitement.', example: 'The team was exuberant after shipping the feature on time.' },
  { word: 'Veracity', pronunciation: '/vəˈræs.ɪ.ti/', partOfSpeech: 'noun', meaning: 'Conformity to facts; accuracy and truthfulness.', example: 'The veracity of his data made the report trustworthy.' },
  { word: 'Audacious', pronunciation: '/ɔːˈdeɪ.ʃəs/', partOfSpeech: 'adjective', meaning: 'Showing a willingness to take bold risks.', example: 'Her audacious goal pushed her to new heights.' },
  { word: 'Galvanize', pronunciation: '/ˈɡæl.və.naɪz/', partOfSpeech: 'verb', meaning: 'To shock or excite someone into taking action.', example: 'The keynote speech galvanized the audience into action.' },
  { word: 'Nascent', pronunciation: '/ˈnæs.ənt/', partOfSpeech: 'adjective', meaning: 'Just beginning to develop; emerging.', example: 'The nascent startup showed incredible promise.' },
  { word: 'Aplomb', pronunciation: '/əˈplɒm/', partOfSpeech: 'noun', meaning: 'Self-confidence or assurance, especially in a demanding situation.', example: 'She handled the crisis with remarkable aplomb.' },
  { word: 'Erudite', pronunciation: '/ˈer.ʊ.daɪt/', partOfSpeech: 'adjective', meaning: 'Having or showing great knowledge or learning.', example: 'His erudite approach to the problem saved hours of work.' },
];

/** Get today's word based on the day of the year */
function getTodaysWord(): WordEntry {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return WORDS[dayOfYear % WORDS.length];
}

function WordOfTheDay() {
  const word = getTodaysWord();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionIcon}>📖</Text>
        <Text style={styles.sectionTitle}>Word of the Day</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.wordRow}>
          <Text style={styles.word}>{word.word}</Text>
          <Text style={styles.partOfSpeech}>{word.partOfSpeech}</Text>
        </View>
        <Text style={styles.pronunciation}>{word.pronunciation}</Text>
        <Text style={styles.meaning}>{word.meaning}</Text>
        <View style={styles.exampleBox}>
          <Text style={styles.exampleLabel}>Example</Text>
          <Text style={styles.example}>"{word.example}"</Text>
        </View>
      </View>
    </View>
  );
}

export default React.memo(WordOfTheDay);

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#e94560',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  word: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e94560',
  },
  partOfSpeech: {
    fontSize: 12,
    color: '#a0a0b0',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pronunciation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  meaning: {
    fontSize: 14,
    color: '#d0d0e0',
    lineHeight: 20,
    marginBottom: 12,
  },
  exampleBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 10,
  },
  exampleLabel: {
    fontSize: 10,
    color: '#a0a0b0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  example: {
    fontSize: 13,
    color: '#c0c0d0',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
