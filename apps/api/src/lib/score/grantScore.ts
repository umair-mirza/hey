import { ALL_EVENTS } from '@hey/data/tracking';
import logger from '@hey/lib/logger';

import heyPrisma from '../heyPrisma';
import findEventKeyDeep from '../leafwatch/findEventKeyDeep';
import {
  getFingerprintByActor,
  getFingerprintByWallet
} from '../leafwatch/getFingerprint';
import { getIpByActor, getIpByWallet } from '../leafwatch/getIp';
import createStackClient from './createStackClient';

const allowedSelfScoreEvents = ['NEW_POST', 'NEW_COMMENT', 'NEW_QUOTE'];

const isSelfScoreEvent = (eventKey: string): boolean => {
  return allowedSelfScoreEvents.includes(eventKey);
};

const findScorableEventByEventType = async (eventType: string) => {
  return await heyPrisma.scorableEvent.findUnique({ where: { eventType } });
};

const findEventKey = (eventString: string): null | string => {
  return findEventKeyDeep(ALL_EVENTS, eventString);
};

const grantScore = async ({
  grantingAddress,
  id,
  name,
  pointSystemId,
  sourceActor,
  sourceAddress,
  targetAddress
}: {
  grantingAddress: string;
  id: string;
  name: string;
  pointSystemId: number;
  sourceActor: string;
  sourceAddress?: string;
  targetAddress?: string;
}): Promise<null | string> => {
  // Allow only allowed events
  const eventKey = findEventKey(name);
  if (!eventKey) {
    return null;
  }

  // If the source and target addresses are the same, we don't grant points except for allowed self-score events
  if (sourceAddress === targetAddress && !isSelfScoreEvent(eventKey)) {
    logger.info(
      `Abuse: Source and target address are the same - Source: ${sourceAddress} - Target: ${targetAddress} - Event: ${eventKey}`
    );
    return null;
  }

  // Promises
  const [
    sourceActorFingerprint,
    targetAddressFingerprint,
    sourceActorIp,
    targetAddressIp
  ] = await Promise.all([
    getFingerprintByActor(sourceActor),
    getFingerprintByWallet(targetAddress),
    getIpByActor(sourceActor),
    getIpByWallet(targetAddress)
  ]);

  // To prevent abuse, we don't grant points if the actor and wallet fingerprints are the same except for allowed self-score events
  if (
    sourceActorFingerprint &&
    targetAddressFingerprint &&
    sourceActorFingerprint === targetAddressFingerprint &&
    !isSelfScoreEvent(eventKey)
  ) {
    logger.info(
      `Abuse: Actor fingerprint and wallet fingerprint are the same - Actor: ${sourceActor} - Wallet: ${targetAddress} - Event: ${eventKey}`
    );
    return null;
  }

  // To prevent abuse, we don't grant points if the actor and wallet IPs are the same except for allowed self-score events
  if (
    sourceActorIp &&
    targetAddressIp &&
    sourceActorIp === targetAddressIp &&
    !isSelfScoreEvent(eventKey)
  ) {
    logger.info(
      `Abuse: Actor IP and wallet IP are the same - Actor: ${sourceActor} - ${sourceActorIp} - Wallet: ${targetAddress} - ${targetAddressIp} - Event: ${eventKey}`
    );
    return null;
  }

  try {
    const event = await findScorableEventByEventType(eventKey);
    if (event?.points) {
      const stack = createStackClient(pointSystemId);
      try {
        const { messageId } = await stack.track(event.eventType, {
          account: grantingAddress,
          metadata: { actor: sourceActor },
          points: event.points,
          uniqueId: id
        });

        logger.info(
          `Granted ${event.points} points to ${grantingAddress} for ${event.eventType} by ${sourceActor} - ${messageId}`
        );
      } catch {
        logger.error('Error granting score on stack.so');
      }
    }
  } catch {
    logger.info('Error finding scorable event');
  }

  return id;
};

export default grantScore;
