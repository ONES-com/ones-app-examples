import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatcherRule } from '../entities/watcher-rule.entity';
import { WatcherRuleInput } from '../dto/watcher-rule.dto';

@Injectable()
export class WatcherRuleService {
  constructor(
    @InjectRepository(WatcherRule)
    private watcherRuleRepository: Repository<WatcherRule>,
  ) {}

  async getActiveRule(): Promise<WatcherRule | null> {
    return this.watcherRuleRepository.findOne({ where: { active: true } });
  }

  async saveRule(
    input: WatcherRuleInput,
    createdBy?: string,
  ): Promise<WatcherRule> {
    let rule = await this.getActiveRule();
    if (!rule) {
      rule = this.watcherRuleRepository.create();
    }

    rule.projectId = input.projectId;
    rule.teamId = input.teamId;
    rule.watcherUserIds = input.watcherUserIds ?? [];
    rule.active = true;

    if (!rule.createdBy) {
      rule.createdBy = createdBy ?? '';
    }

    return this.watcherRuleRepository.save(rule);
  }
}
