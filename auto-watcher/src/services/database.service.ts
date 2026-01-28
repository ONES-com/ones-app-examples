import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstallCallback } from '../entities/install-callback.entity';
import { InstallationInfo } from '../dto/install-callback.dto';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(InstallCallback)
    private installCallbackRepository: Repository<InstallCallback>,
  ) {}

  async saveInstallCallback(req: InstallationInfo): Promise<void> {
    const installCallback = new InstallCallback();
    Object.assign(installCallback, {
      installation_id: req.installation_id,
      org_id: req.org_id,
      ones_base_url: req.ones_base_url,
      shared_secret: req.shared_secret,
      callback_type: req.callback_type,
      time_stamp: req.time_stamp,
      app_id: req.app?.id || null,
      app_version: req.app?.version || null,
    });

    await this.installCallbackRepository.save(installCallback);
    console.log(
      `Install callback info saved: InstallationID=${req.installation_id}, OrgID=${req.org_id}, Secret=${req.shared_secret}`,
    );
  }

  async getInstallation(
    installationID: string,
  ): Promise<InstallationInfo | null> {
    const installCallback = await this.installCallbackRepository.findOne({
      where: { installation_id: installationID },
    });

    if (!installCallback) {
      return null;
    }

    return {
      installation_id: installCallback.installation_id,
      org_id: installCallback.org_id,
      ones_base_url: installCallback.ones_base_url,
      shared_secret: installCallback.shared_secret,
      callback_type: installCallback.callback_type,
      time_stamp: installCallback.time_stamp,
      app: installCallback.app_id
        ? {
            id: installCallback.app_id,
            version: installCallback.app_version,
          }
        : undefined,
    };
  }

  async getAllInstallations(): Promise<InstallationInfo[]> {
    const installCallbacks = await this.installCallbackRepository.find();

    return installCallbacks.map((installCallback) => ({
      installation_id: installCallback.installation_id,
      org_id: installCallback.org_id,
      ones_base_url: installCallback.ones_base_url,
      shared_secret: installCallback.shared_secret,
      callback_type: installCallback.callback_type,
      time_stamp: installCallback.time_stamp,
      app: installCallback.app_id
        ? {
            id: installCallback.app_id,
            version: installCallback.app_version,
          }
        : undefined,
    }));
  }
}
