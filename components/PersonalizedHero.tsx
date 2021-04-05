import { contentfulOptimizeListReader } from '@uniformdev/optimize-tracker-contentful';
import { PersonalizeNesi } from '@uniformdev/optimize-tracker-react';
import { Entry } from 'contentful';
import { PersonalizedHeroFields } from '../lib/contentful';
import Hero from './Hero';

export const PersonalizedHero: React.FC<Entry<PersonalizedHeroFields>> = ({ fields }) => {
  const list = contentfulOptimizeListReader(fields.unfrmOptP13nList);
  return (
    <PersonalizeNesi
      name="personalized-hero"
      trackingEventName="heroPersonalized"
      variations={list}
      component={Hero}
    />
  );
};
