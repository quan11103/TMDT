import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private config: ConfigService) {
    super({
      clientID: config.getOrThrow('FACEBOOK_CLIENT_ID'),
      clientSecret: config.getOrThrow('FACEBOOK_CLIENT_SECRET'),
      callbackURL: config.getOrThrow('FACEBOOK_CALLBACK_URL'),
      profileFields: ['id', 'emails', 'name'],
      scope: ['email'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any) => void,
  ) {
    const { emails, name } = profile;

    const user = {
      email: emails?.[0].value ?? null,
      full_name: `${name?.givenName ?? ''} ${name?.familyName ?? ''}`.trim(),
      provider: 'facebook',
    };

    done(null, user);
  }
}
